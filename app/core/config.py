from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongodb_uri: str = "mongodb://localhost:27017"
    database_name: str = "unitatlas"

    model_config = {"env_file": ".env"}


settings = Settings()
