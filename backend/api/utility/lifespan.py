from contextlib import asynccontextmanager

@asynccontextmanager
async def LifeSpan(app):
    from api.configs.logging import logInfo
    logInfo("-----------------STARTED----------------------")
    yield 
    logInfo("-----------------ENDED----------------------")