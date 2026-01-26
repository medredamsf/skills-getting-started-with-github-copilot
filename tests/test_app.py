import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    assert isinstance(response.json(), dict)

def test_signup_and_unregister():
    activity = list(client.get("/activities").json().keys())[0]
    email = "testuser@mergington.edu"
    # Inscription
    signup = client.post(f"/activities/{activity}/signup?email={email}")
    assert signup.status_code == 200
    assert "Signed up" in signup.json()["message"]
    # Désinscription
    unregister = client.delete(f"/activities/{activity}/unregister?email={email}")
    assert unregister.status_code == 200
    assert "Unregistered" in unregister.json()["message"]

def test_signup_duplicate():
    activity = list(client.get("/activities").json().keys())[0]
    email = "testdup@mergington.edu"
    client.post(f"/activities/{activity}/signup?email={email}")
    # Inscription en double
    duplicate = client.post(f"/activities/{activity}/signup?email={email}")
    assert duplicate.status_code == 400
    assert "already signed up" in duplicate.json()["detail"]
    # Nettoyage
    client.delete(f"/activities/{activity}/unregister?email={email}")
