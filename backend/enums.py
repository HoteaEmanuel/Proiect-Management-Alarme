from enum import Enum

class Status(str,Enum):
    ACTIVE = "active"
    ACKNOWLEDGED = "acknowledged"
    CLEARED = "cleared"
    CLOSED = "closed"

class AlarmType(str,Enum):
    SYSTEM = "system"
    APPLICATION = "application"
    NETWORK = "network"
    SECURITY = "security"
    
    
class CategoryType(str,Enum):
    INFRASTRUCTURE = "infrastructure"
    APPLICATION = "application"
    NETWORK = "network"
    SECURITY = "security"
    DATABASE = "database"
    CLOUD = "cloud"
    
class SubCategoryType(str,Enum):
    CPU = "cpu"
    MEMORY = "memory"
    DISK = "disk"
    API = "api"
    SERVICE = "service"
    CONNECTION = "connection"
    AUTHENTICATION = "authentication"
    LATENCY = "latency"
    
    
class Details(str,Enum):
    HIGH_CPU_USAGE = "high_cpu_usage"
    MEMORY_LEAK = "memory_leak"
    DISK_FULL = "disk_full"
    API_TIMEOUT = "api_timeout"
    SERVICE_DOWN = "service_down"      