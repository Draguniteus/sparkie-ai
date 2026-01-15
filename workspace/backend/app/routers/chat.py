"""
Chat API endpoints - The heart of Sparkie's conversations.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
import json

from app.models.database import async_session, Conversation, Message
from app.models.schemas import ChatRequest, ChatResponse, ConversationResponse
from app.services.minimax import get_minimax_service, MiniMaxService
from app.services.sparkie_prompt import get_sparkie_system_prompt, get_greeting
from app.middleware.auth import get_current_user, User
from loguru import logger


router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    minimax_service: MiniMaxService = Depends(get_minimax_service)
):
    """Send a message to Sparkie and get a response (non-streaming)."""
    try:
        # Get or create conversation
        conversation_id = request.conversation_id
        if conversation_id is None:
            conversation = Conversation(user_id=current_user.id, title="Chat with Sparkie")
            async with async_session() as session:
                session.add(conversation)
                await session.commit()
                await session.refresh(conversation)
            conversation_id = conversation.id
            
            # Add greeting
            is_creator = (current_user.username == "WeGotHeaven")
            greeting = get_greeting(username=current_user.username, is_creator=is_creator)
            msg = Message(conversation_id=conversation_id, role="assistant", content=greeting)
            async with async_session() as session:
                session.add(msg)
                await session.commit()
        
        # Add user message
        user_msg = Message(conversation_id=conversation_id, role="user", content=request.message)
        async with async_session() as session:
            session.add(user_msg)
            await session.commit()
        
        # Get conversation history
        async with async_session() as session:
            result = await session.execute(
                select(Message).where(Message.conversation_id == conversation_id).order_by(Message.created_at.asc())
            )
            messages = list(result.scalars().all())
        
        # Build messages for API
        is_creator = (current_user.username == "WeGotHeaven")
        system_prompt = get_sparkie_system_prompt(username=current_user.username, is_creator=is_creator)
        
        api_messages = [{"role": "system", "content": system_prompt}]
        for msg in messages[-20:]:
            api_messages.append({"role": msg.role, "content": msg.content})
        
        # Get AI response
        response_text = ""
        async for chunk in minimax_service.chat(
            messages=api_messages,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            stream=False
        ):
            response_text += chunk
        
        # Save assistant message
        assistant_msg = Message(conversation_id=conversation_id, role="assistant", content=response_text)
        async with async_session() as session:
            session.add(assistant_msg)
            await session.commit()
        
        logger.info(f"Chat completed for user {current_user.username}")
        
        return ChatResponse(conversation_id=conversation_id, message=response_text)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process chat: {str(e)}")


@router.post("/stream")
async def chat_stream(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    minimax_service: MiniMaxService = Depends(get_minimax_service)
):
    """Send a message to Sparkie and stream the response."""
    try:
        if not request.stream:
            raise HTTPException(status_code=400, detail="stream=true is required")
        
        # Get or create conversation
        conversation_id = request.conversation_id
        if conversation_id is None:
            conversation = Conversation(user_id=current_user.id, title="Chat with Sparkie")
            async with async_session() as session:
                session.add(conversation)
                await session.commit()
                await session.refresh(conversation)
            conversation_id = conversation.id
            
            is_creator = (current_user.username == "WeGotHeaven")
            greeting = get_greeting(username=current_user.username, is_creator=is_creator)
            msg = Message(conversation_id=conversation_id, role="assistant", content=greeting)
            async with async_session() as session:
                session.add(msg)
                await session.commit()
        
        # Add user message
        user_msg = Message(conversation_id=conversation_id, role="user", content=request.message)
        async with async_session() as session:
            session.add(user_msg)
            await session.commit()
        
        # Get history
        async with async_session() as session:
            result = await session.execute(
                select(Message).where(Message.conversation_id == conversation_id).order_by(Message.created_at.asc())
            )
            messages = list(result.scalars().all())
        
        is_creator = (current_user.username == "WeGotHeaven")
        system_prompt = get_sparkie_system_prompt(username=current_user.username, is_creator=is_creator)
        
        api_messages = [{"role": "system", "content": system_prompt}]
        for msg in messages[-20:]:
            api_messages.append({"role": msg.role, "content": msg.content})
        
        async def generate():
            response_text = ""
            async for chunk in minimax_service.chat(
                messages=api_messages,
                temperature=request.temperature,
                max_tokens=request.max_tokens,
                stream=True
            ):
                response_text += chunk
                yield f"data: {json.dumps({'chunk': chunk, 'done': False})}\n\n"
            
            # Save assistant message
            assistant_msg = Message(conversation_id=conversation_id, role="assistant", content=response_text)
            async with async_session() as session:
                session.add(assistant_msg)
                await session.commit()
            
            yield f"data: {json.dumps({'chunk': '', 'done': True, 'conversation_id': conversation_id})}\n\n"
        
        return generate()
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Streaming error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to stream response: {str(e)}")


@router.get("/conversations", response_model=list[ConversationResponse])
async def get_conversations(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user)
):
    """Get all conversations for the current user."""
    try:
        async with async_session() as session:
            result = await session.execute(
                select(Conversation)
                .where(Conversation.user_id == current_user.id)
                .order_by(Conversation.updated_at.desc())
                .offset(offset)
                .limit(limit)
            )
            conversations = list(result.scalars().all())
        
        result = []
        for conv in conversations:
            async with async_session() as session:
                count_result = await session.execute(
                    select("count(Message.id)").where(Message.conversation_id == conv.id)
                )
                msg_count = count_result.scalar() or 0
            
            result.append(ConversationResponse(
                id=conv.id,
                title=conv.title,
                created_at=conv.created_at,
                updated_at=conv.updated_at,
                message_count=msg_count
            ))
        
        return result
        
    except Exception as e:
        logger.error(f"Error getting conversations: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch conversations")


# Import select at the top
from sqlalchemy import select
