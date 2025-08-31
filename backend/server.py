from fastapi import FastAPI, APIRouter, Request, HTTPException, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone
from enum import Enum
from bson import ObjectId
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

# Helper function to convert MongoDB ObjectId to string
def serialize_mongo_data(data):
    if isinstance(data, list):
        return [serialize_mongo_data(item) for item in data]
    elif isinstance(data, dict):
        result = {}
        for key, value in data.items():
            if isinstance(value, ObjectId):
                result[key] = str(value)
            elif isinstance(value, (dict, list)):
                result[key] = serialize_mongo_data(value)
            else:
                result[key] = value
        return result
    elif isinstance(data, ObjectId):
        return str(data)
    else:
        return data

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Stripe integration
stripe_api_key = os.environ.get('STRIPE_API_KEY')
if not stripe_api_key:
    raise ValueError("STRIPE_API_KEY not found in environment variables")

# Services Configuration
SERVICES = {
    "amor": {
        "name": "Ritual de Amor",
        "description": "Ritual para atrair o amor verdadeiro e fortalecer relacionamentos",
        "price": 297.00,
        "duration": "3-7 dias",
        "image": "https://images.unsplash.com/photo-1666730098837-f9ef89a37183?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODB8MHwxfHNlYXJjaHwxfHxyaXR1YWwlMjBjYW5kbGVzfGVufDB8fHx8MTc1NjY2Mzc0OXww&ixlib=rb-4.1.0&q=85"
    },
    "protecao": {
        "name": "Ritual de Proteção",
        "description": "Proteção contra energias negativas e inveja",
        "price": 197.00,
        "duration": "1-3 dias",
        "image": "https://images.unsplash.com/photo-1560427450-00fa9481f01e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwxfHxjcnlzdGFsc3xlbnwwfHx8fDE3NTY2NjM3NTR8MA&ixlib=rb-4.1.0&q=85"
    },
    "prosperidade": {
        "name": "Ritual de Prosperidade",
        "description": "Atração de abundância financeira e oportunidades",
        "price": 397.00,
        "duration": "7-14 dias",
        "image": "https://images.unsplash.com/photo-1527380992061-b126c88cbb41?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHxteXN0aWNhbCUyMHNwaXJpdHVhbHxlbnwwfHx8fDE3NTY2NjM3NDN8MA&ixlib=rb-4.1.0&q=85"
    },
    "limpeza": {
        "name": "Limpeza Energética",
        "description": "Limpeza espiritual profunda e renovação das energias",
        "price": 147.00,
        "duration": "1 dia",
        "image": "https://images.unsplash.com/photo-1696562535437-d542584811bf?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODB8MHwxfHNlYXJjaHwzfHxyaXR1YWwlMjBjYW5kbGVzfGVufDB8fHx8MTc1NjY2Mzc0OXww&ixlib=rb-4.1.0&q=85"
    }
}

# Define Models
class PaymentStatus(str, Enum):
    INITIATED = "initiated"
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    EXPIRED = "expired"

class ServiceType(str, Enum):
    AMOR = "amor"
    PROTECAO = "protecao"
    PROSPERIDADE = "prosperidade"
    LIMPEZA = "limpeza"

class ClientForm(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    payment_session_id: str
    nome_completo: str
    data_nascimento: str
    telefone: str
    nome_pessoa_amada: Optional[str] = None
    situacao_atual: str
    observacoes: Optional[str] = None
    service_type: ServiceType
    video_links: Optional[List[str]] = []
    status: str = "pendente"  # pendente, em_andamento, concluido
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ClientFormCreate(BaseModel):
    payment_session_id: str
    nome_completo: str
    data_nascimento: str
    telefone: str
    nome_pessoa_amada: Optional[str] = None
    situacao_atual: str
    observacoes: Optional[str] = None
    service_type: ServiceType

class PaymentTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    service_type: ServiceType
    amount: float
    currency: str = "brl"
    payment_status: PaymentStatus
    metadata: Optional[Dict] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CheckoutRequest(BaseModel):
    service_type: ServiceType
    origin_url: str

class AdminLogin(BaseModel):
    password: str

class VideoLink(BaseModel):
    client_id: str
    video_url: str
    title: str
    description: Optional[str] = None

class ConsultaAgendamento(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nome_completo: str
    telefone: str
    data_consulta: str
    horario: str
    valor: float = 50.00
    status: str = "agendado"  # agendado, confirmado, realizado, cancelado
    observacoes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ConsultaAgendamentoCreate(BaseModel):
    nome_completo: str
    telefone: str
    data_consulta: str
    horario: str
    observacoes: Optional[str] = None

class FlyerContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    titulo: str
    subtitulo: Optional[str] = None
    imagem_url: Optional[str] = None
    descricao: str
    ativo: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FlyerContentCreate(BaseModel):
    titulo: str
    subtitulo: Optional[str] = None
    imagem_url: Optional[str] = None
    descricao: str

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Mystic Services API"}

@api_router.get("/services")
async def get_services():
    return {"services": SERVICES}

@api_router.post("/checkout/session")
async def create_checkout_session(request: CheckoutRequest):
    try:
        # Validate service exists
        if request.service_type not in SERVICES:
            raise HTTPException(status_code=400, detail="Serviço inválido")
        
        service = SERVICES[request.service_type]
        amount = service["price"]
        
        # Create success and cancel URLs
        success_url = f"{request.origin_url}/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{request.origin_url}/cancel"
        
        # Initialize Stripe checkout
        webhook_url = f"{request.origin_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
        
        # Create checkout session
        checkout_request = CheckoutSessionRequest(
            amount=amount,
            currency="brl",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "service_type": request.service_type,
                "service_name": service["name"]
            }
        )
        
        session = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Create payment transaction record
        transaction = PaymentTransaction(
            session_id=session.session_id,
            service_type=request.service_type,
            amount=amount,
            payment_status=PaymentStatus.INITIATED,
            metadata=checkout_request.metadata
        )
        
        await db.payment_transactions.insert_one(transaction.dict())
        
        return {"url": session.url, "session_id": session.session_id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar sessão de pagamento: {str(e)}")

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str):
    try:
        # Initialize Stripe checkout (webhook_url not needed for status check)
        stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
        
        # Get status from Stripe
        status_response = await stripe_checkout.get_checkout_status(session_id)
        
        # Update local transaction record
        update_data = {
            "payment_status": PaymentStatus.COMPLETED if status_response.payment_status == "paid" else PaymentStatus.PENDING,
            "updated_at": datetime.now(timezone.utc)
        }
        
        if status_response.status == "expired":
            update_data["payment_status"] = PaymentStatus.EXPIRED
        
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": update_data}
        )
        
        return {
            "status": status_response.status,
            "payment_status": status_response.payment_status,
            "amount_total": status_response.amount_total,
            "currency": status_response.currency,
            "metadata": status_response.metadata
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao verificar status do pagamento: {str(e)}")

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    try:
        body = await request.body()
        
        # Initialize Stripe checkout
        stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
        
        # Handle webhook
        webhook_response = await stripe_checkout.handle_webhook(body, stripe_signature)
        
        if webhook_response.event_type == "checkout.session.completed":
            # Update payment transaction
            await db.payment_transactions.update_one(
                {"session_id": webhook_response.session_id},
                {"$set": {
                    "payment_status": PaymentStatus.COMPLETED,
                    "updated_at": datetime.now(timezone.utc)
                }}
            )
        
        return {"status": "success"}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook error: {str(e)}")

@api_router.post("/client-form")
async def submit_client_form(form_data: ClientFormCreate):
    try:
        # Verify payment was completed
        transaction = await db.payment_transactions.find_one({"session_id": form_data.payment_session_id})
        if not transaction or transaction["payment_status"] != PaymentStatus.COMPLETED:
            raise HTTPException(status_code=400, detail="Pagamento não encontrado ou não confirmado")
        
        # Create client form record
        client_form = ClientForm(**form_data.dict())
        await db.client_forms.insert_one(client_form.dict())
        
        return {"message": "Formulário enviado com sucesso!", "id": client_form.id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao enviar formulário: {str(e)}")

# Admin Routes
@api_router.post("/admin/login")
async def admin_login(login_data: AdminLogin):
    if login_data.password != "admin123":
        raise HTTPException(status_code=401, detail="Senha incorreta")
    return {"message": "Login realizado com sucesso", "token": "admin_authenticated"}

@api_router.get("/admin/clients")
async def get_clients(authorization: str = Header(None)):
    if authorization != "Bearer admin_authenticated":
        raise HTTPException(status_code=401, detail="Não autorizado")
    
    try:
        # Get all client forms with payment info
        clients = await db.client_forms.find().to_list(1000)
        
        # Enrich with payment information
        for client in clients:
            transaction = await db.payment_transactions.find_one({"session_id": client["payment_session_id"]})
            if transaction:
                client["payment_info"] = {
                    "amount": transaction["amount"],
                    "payment_status": transaction["payment_status"],
                    "service_name": SERVICES.get(transaction["service_type"], {}).get("name", "Serviço desconhecido")
                }
        
        # Serialize MongoDB data to make it JSON compatible
        clients = serialize_mongo_data(clients)
        
        return {"clients": clients}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar clientes: {str(e)}")

@api_router.post("/admin/send-video")
async def send_video_link(video_data: VideoLink, authorization: str = Header(None)):
    if authorization != "Bearer admin_authenticated":
        raise HTTPException(status_code=401, detail="Não autorizado")
    
    try:
        # Update client with video link
        await db.client_forms.update_one(
            {"id": video_data.client_id},
            {"$push": {"video_links": {
                "url": video_data.video_url,
                "title": video_data.title,
                "description": video_data.description,
                "sent_at": datetime.now(timezone.utc)
            }}}
        )
        
        return {"message": "Link do vídeo adicionado com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao enviar link: {str(e)}")

@api_router.put("/admin/client-status/{client_id}")
async def update_client_status(client_id: str, status: str, authorization: str = Header(None)):
    if authorization != "Bearer admin_authenticated":
        raise HTTPException(status_code=401, detail="Não autorizado")
    
    valid_statuses = ["pendente", "em_andamento", "concluido"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Status inválido")
    
    try:
        await db.client_forms.update_one(
            {"id": client_id},
            {"$set": {"status": status, "updated_at": datetime.now(timezone.utc)}}
        )
        
        return {"message": "Status atualizado com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar status: {str(e)}")

# Consultas Agendamento Routes
@api_router.post("/consulta/agendar")
async def agendar_consulta(consulta: ConsultaAgendamentoCreate):
    try:
        # Check if slot is available
        existing = await db.consultas.find_one({
            "data_consulta": consulta.data_consulta,
            "horario": consulta.horario,
            "status": {"$in": ["agendado", "confirmado"]}
        })
        
        if existing:
            raise HTTPException(status_code=400, detail="Horário já ocupado")
        
        # Create consultation
        nova_consulta = ConsultaAgendamento(**consulta.dict())
        await db.consultas.insert_one(nova_consulta.dict())
        
        return {
            "message": "Consulta agendada com sucesso!",
            "consulta_id": nova_consulta.id,
            "whatsapp_link": f"https://wa.me/5511999999999?text=Olá! Agendei uma consulta para {consulta.data_consulta} às {consulta.horario}. Aguardo confirmação."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao agendar consulta: {str(e)}")

@api_router.get("/admin/consultas")
async def get_consultas(authorization: str = Header(None)):
    if authorization != "Bearer admin_authenticated":
        raise HTTPException(status_code=401, detail="Não autorizado")
    
    consultas = await db.consultas.find().sort("data_consulta", 1).to_list(1000)
    return {"consultas": consultas}

@api_router.put("/admin/consulta/{consulta_id}/status")
async def update_consulta_status(consulta_id: str, status: str, authorization: str = Header(None)):
    if authorization != "Bearer admin_authenticated":
        raise HTTPException(status_code=401, detail="Não autorizado")
    
    valid_statuses = ["agendado", "confirmado", "realizado", "cancelado"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Status inválido")
    
    try:
        await db.consultas.update_one(
            {"id": consulta_id},
            {"$set": {"status": status, "updated_at": datetime.now(timezone.utc)}}
        )
        
        return {"message": "Status da consulta atualizado"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar consulta: {str(e)}")

# Flyers Routes
@api_router.post("/admin/flyer")
async def create_flyer(flyer: FlyerContentCreate, authorization: str = Header(None)):
    if authorization != "Bearer admin_authenticated":
        raise HTTPException(status_code=401, detail="Não autorizado")
    
    try:
        # Deactivate other flyers
        await db.flyers.update_many({}, {"$set": {"ativo": False}})
        
        # Create new active flyer
        novo_flyer = FlyerContent(**flyer.dict())
        await db.flyers.insert_one(novo_flyer.dict())
        
        return {"message": "Flyer criado com sucesso", "flyer_id": novo_flyer.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar flyer: {str(e)}")

@api_router.get("/flyer-ativo")
async def get_active_flyer():
    try:
        flyer = await db.flyers.find_one({"ativo": True})
        if flyer:
            return {"flyer": flyer}
        return {"flyer": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar flyer: {str(e)}")

@api_router.get("/admin/flyers")
async def get_all_flyers(authorization: str = Header(None)):
    if authorization != "Bearer admin_authenticated":
        raise HTTPException(status_code=401, detail="Não autorizado")
    
    try:
        flyers = await db.flyers.find().sort("created_at", -1).to_list(1000)
        # Serialize MongoDB data to make it JSON compatible
        flyers = serialize_mongo_data(flyers)
        return {"flyers": flyers}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar flyers: {str(e)}")

@api_router.get("/horarios-disponiveis/{data}")
async def get_available_slots(data: str):
    try:
        # Get occupied slots for the date
        consultas_dia = await db.consultas.find({
            "data_consulta": data,
            "status": {"$in": ["agendado", "confirmado"]}
        }).to_list(1000)
        
        occupied_slots = [c["horario"] for c in consultas_dia]
        
        # Generate available slots (14:00 to 22:00, 20min each)
        available_slots = []
        start_hour = 14
        end_hour = 22
        
        for hour in range(start_hour, end_hour):
            for minute in [0, 20, 40]:
                slot = f"{hour:02d}:{minute:02d}"
                if slot not in occupied_slots:
                    available_slots.append(slot)
        
        return {"horarios_disponiveis": available_slots}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar horários: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()