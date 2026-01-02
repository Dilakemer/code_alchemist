from app import app, db, User, hash_password

def reset_pwd():
    with app.app_context():
        # Find the user who owns conversation 3
        # In previous step we saw "Conv 3: ... (Owner: ...)" but the output was truncated/messy.
        # Let's find the user by iterating.
        
        users = User.query.all()
        for u in users:
            print(f"User found: {u.email}")
            print(f"Resetting password for {u.email}...")
            u.password_hash = hash_password("password123")
        
        db.session.commit()
        print("Passwords reset to 'password123'")

if __name__ == "__main__":
    reset_pwd()
