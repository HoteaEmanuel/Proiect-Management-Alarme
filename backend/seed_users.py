# Ce face scriptul:
# - se conecteaza la baza de date
# - verifica daca username-ul sau email-ul exista deja
# - hash-uieste parola folosind bcrypt
# - insereaza doar userii care nu exista deja

# Se ruleaza cu: "python seed_users.py"g

from passlib.context import CryptContext
from database import SessionLocal
from models.users import Users

bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


users_to_seed = [
    {
        "username": "admin",
        "email": "admin@example.com",
        "first_name": "Admin",
        "last_name": "System",
        "password": "admin123"
    },
    {
        "username": "darius",
        "email": "darius@example.com",
        "first_name": "Darius",
        "last_name": "Jderu",
        "password": "darius123"
    },
    {
        "username": "alex",
        "email": "alex@example.com",
        "first_name": "Alex",
        "last_name": "Popescu",
        "password": "alex123"
    },
    {
        "username": "maria",
        "email": "maria@example.com",
        "first_name": "Maria",
        "last_name": "Ionescu",
        "password": "maria123"
    },
    {
        "username": "andrei",
        "email": "andrei@example.com",
        "first_name": "Andrei",
        "last_name": "Georgescu",
        "password": "andrei123"
    },
    {
        "username": "teodora",
        "email": "teodora@example.com",
        "first_name": "Teodora",
        "last_name": "Marin",
        "password": "teodora123"
    },
    {
        "username": "mihai",
        "email": "mihai@example.com",
        "first_name": "Mihai",
        "last_name": "Stan",
        "password": "mihai123"
    },
    {
        "username": "elena",
        "email": "elena@example.com",
        "first_name": "Elena",
        "last_name": "Dumitru",
        "password": "elena123"
    },
    {
        "username": "rares",
        "email": "rares@example.com",
        "first_name": "Rares",
        "last_name": "Matei",
        "password": "rares123"
    },
    {
        "username": "bianca",
        "email": "bianca@example.com",
        "first_name": "Bianca",
        "last_name": "Enache",
        "password": "bianca123"
    },
]


def seed_users():
    db = SessionLocal()

    try:
        added_count = 0

        for user_data in users_to_seed:
            existing_user = db.query(Users).filter(
                (Users.username == user_data["username"]) |
                (Users.email == user_data["email"])
            ).first()

            if existing_user:
                print(f"[SKIP] User deja exista: {user_data['username']}")
                continue

            new_user = Users(
                username=user_data["username"],
                email=user_data["email"],
                first_name=user_data["first_name"],
                last_name=user_data["last_name"],
                hashed_password=bcrypt_context.hash(user_data["password"])
            )

            db.add(new_user)
            added_count += 1

        db.commit()
        print(f"\nSeed complet. Au fost adaugati {added_count} useri.")

    except Exception as e:
        db.rollback()
        print(f"Eroare la seed: {e}")

    finally:
        db.close()


if __name__ == "__main__":
    seed_users()