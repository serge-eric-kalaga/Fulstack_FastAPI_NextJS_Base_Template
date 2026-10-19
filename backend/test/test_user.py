from test.baseTest import BaseTest, User


class TestUser(BaseTest):
    """
    Test des routes de l'utilisateur
    """

    def test_create_user(self):
        payload = {
            "username": "sergakalaga",
            "password": "12345678",
            "telephone": self.fake.basic_phone_number(),
        }
        request = self.client.post("/api/auth/register", json=payload)

        self.assertBase(request=request)
        assert request.json()["data"]["username"] == payload["username"]

    def test_update_user(self):
        self.auth()
        test_user = self.createTestUser()
        request = self.client.put(
            f"/api/user/{test_user.username}", json={"username": "testuserupdated"}
        )

        self.assertBase(request=request)
        assert request.json()["data"]["username"] == "testuserupdated"
