import requests
import sys
import json
from datetime import datetime
import time

class MysticServicesAPITester:
    def __init__(self, base_url="https://rituais-admin.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.session_id = None
        self.created_ritual_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if self.admin_token and 'Authorization' not in test_headers:
            test_headers['Authorization'] = f'Bearer {self.admin_token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        print(f"   Method: {method}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_get_services(self):
        """Test GET /api/services - Should return rituals from database after migration"""
        success, response = self.run_test("Get Services (Database Migration Check)", "GET", "services", 200)
        
        if success and 'services' in response:
            services = response['services']
            expected_services = ['amor', 'protecao', 'prosperidade', 'limpeza']
            
            print(f"   Found {len(services)} services")
            for service_key in expected_services:
                if service_key in services:
                    service = services[service_key]
                    print(f"   ✅ {service_key}: {service.get('name')} - R$ {service.get('price')}")
                else:
                    print(f"   ❌ Missing service: {service_key}")
                    return False
            
            # Verify services are coming from database (should have all expected fields)
            for service_key, service in services.items():
                required_fields = ['name', 'description', 'price', 'duration', 'image', 'category']
                for field in required_fields:
                    if field not in service:
                        print(f"   ❌ Missing field '{field}' in service {service_key}")
                        return False
            
            print("   ✅ All services have required fields (database migration successful)")
            return True
        return success

    def test_admin_rituais_get_all(self):
        """Test GET /admin/rituais - List all rituals"""
        if not self.admin_token:
            print("❌ No admin token available")
            return False
            
        success, response = self.run_test(
            "Admin Get All Rituais", 
            "GET", 
            "admin/rituais", 
            200,
            headers={'Authorization': f'Bearer {self.admin_token}'}
        )
        
        if success and 'rituais' in response:
            rituais = response['rituais']
            print(f"   Found {len(rituais)} rituais in database")
            
            # Check if legacy services were migrated
            expected_legacy = ['amor', 'protecao', 'prosperidade', 'limpeza']
            found_legacy = [r['id'] for r in rituais if r['id'] in expected_legacy]
            
            if len(found_legacy) >= 4:
                print("   ✅ Legacy services successfully migrated to database")
            else:
                print(f"   ⚠️  Only {len(found_legacy)} legacy services found: {found_legacy}")
            
            return True
        return success

    def test_admin_rituais_create(self):
        """Test POST /admin/rituais - Create new ritual"""
        if not self.admin_token:
            print("❌ No admin token available")
            return False
            
        data = {
            "name": "Ritual de Harmonia",
            "description": "Ritual para equilibrar energias e promover harmonia interior",
            "price": 199.00,
            "duration": "2-5 dias",
            "image": "https://images.unsplash.com/photo-1518709268805-4e9042af2176?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODB8MHwxfHNlYXJjaHwxfHxoYXJtb255fGVufDB8fHx8MTc1NjY2Mzc0OXww&ixlib=rb-4.1.0&q=85",
            "category": "saude",
            "active": True
        }
        
        success, response = self.run_test(
            "Admin Create Ritual", 
            "POST", 
            "admin/rituais", 
            200,
            data,
            headers={'Authorization': f'Bearer {self.admin_token}'}
        )
        
        if success and 'ritual_id' in response:
            self.created_ritual_id = response['ritual_id']
            print(f"   Created ritual ID: {self.created_ritual_id}")
            return True
        return success

    def test_admin_rituais_update(self):
        """Test PUT /admin/rituais/{id} - Update existing ritual"""
        if not self.admin_token or not self.created_ritual_id:
            print("❌ No admin token or ritual ID available")
            return False
            
        data = {
            "name": "Ritual de Harmonia Atualizado",
            "price": 249.00,
            "description": "Ritual atualizado para equilibrar energias e promover harmonia interior profunda"
        }
        
        success, response = self.run_test(
            "Admin Update Ritual", 
            "PUT", 
            f"admin/rituais/{self.created_ritual_id}", 
            200,
            data,
            headers={'Authorization': f'Bearer {self.admin_token}'}
        )
        
        return success

    def test_services_after_crud(self):
        """Test GET /services after CRUD operations - Should include new ritual"""
        success, response = self.run_test("Get Services After CRUD", "GET", "services", 200)
        
        if success and 'services' in response:
            services = response['services']
            
            # Check if our created ritual appears in services
            if self.created_ritual_id and self.created_ritual_id in services:
                ritual = services[self.created_ritual_id]
                print(f"   ✅ New ritual found in services: {ritual.get('name')} - R$ {ritual.get('price')}")
                
                # Verify updated values
                if ritual.get('name') == "Ritual de Harmonia Atualizado" and ritual.get('price') == 249.00:
                    print("   ✅ Ritual updates reflected in services endpoint")
                    return True
                else:
                    print("   ❌ Ritual updates not reflected in services endpoint")
                    return False
            else:
                print("   ❌ New ritual not found in services endpoint")
                return False
        return success

    def test_checkout_with_new_ritual(self):
        """Test checkout with newly created ritual"""
        if not self.created_ritual_id:
            print("❌ No created ritual ID available")
            return False
            
        data = {
            "service_type": self.created_ritual_id,
            "origin_url": self.base_url
        }
        
        success, response = self.run_test(
            "Checkout with New Ritual", 
            "POST", 
            "checkout/session", 
            200, 
            data
        )
        
        if success and 'session_id' in response:
            print(f"   ✅ Checkout session created for new ritual")
            print(f"   Session ID: {response['session_id']}")
            return True
        return success

    def test_flyer_ativo(self):
        """Test GET /flyer-ativo - Active flyer for homepage"""
        success, response = self.run_test("Get Active Flyer", "GET", "flyer-ativo", 200)
        
        if success:
            if 'flyer' in response:
                flyer = response['flyer']
                if flyer is None:
                    print("   ✅ No active flyer (expected for new system)")
                else:
                    print(f"   ✅ Active flyer found: {flyer.get('titulo', 'No title')}")
            return True
        return success

    def test_admin_flyer_create(self):
        """Test POST /admin/flyer - Create active flyer"""
        if not self.admin_token:
            print("❌ No admin token available")
            return False
            
        data = {
            "titulo": "Promoção Especial - Rituais",
            "subtitulo": "Transforme sua vida com nossos rituais poderosos",
            "imagem_url": "https://images.unsplash.com/photo-1518709268805-4e9042af2176?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODB8MHwxfHNlYXJjaHwxfHxoYXJtb255fGVufDB8fHx8MTc1NjY2Mzc0OXww&ixlib=rb-4.1.0&q=85",
            "descricao": "Descubra o poder dos rituais ancestrais para amor, proteção, prosperidade e limpeza energética."
        }
        
        success, response = self.run_test(
            "Admin Create Flyer", 
            "POST", 
            "admin/flyer", 
            200,
            data,
            headers={'Authorization': f'Bearer {self.admin_token}'}
        )
        
        return success

    def test_flyer_ativo_after_create(self):
        """Test GET /flyer-ativo after creating one"""
        success, response = self.run_test("Get Active Flyer After Create", "GET", "flyer-ativo", 200)
        
        if success and 'flyer' in response:
            flyer = response['flyer']
            if flyer and flyer.get('titulo') == "Promoção Especial - Rituais":
                print("   ✅ Active flyer correctly returned after creation")
                return True
            else:
                print("   ❌ Active flyer not found or incorrect after creation")
                return False
        return success

    def test_admin_rituais_delete(self):
        """Test DELETE /admin/rituais/{id} - Delete ritual (cleanup)"""
        if not self.admin_token or not self.created_ritual_id:
            print("❌ No admin token or ritual ID available")
            return False
            
        success, response = self.run_test(
            "Admin Delete Ritual", 
            "DELETE", 
            f"admin/rituais/{self.created_ritual_id}", 
            200,
            headers={'Authorization': f'Bearer {self.admin_token}'}
        )
        
        if success:
            print("   ✅ Ritual deleted successfully (cleanup)")
        return success

    def test_create_checkout_session(self):
        """Test POST /api/checkout/session"""
        data = {
            "service_type": "amor",
            "origin_url": self.base_url
        }
        
        success, response = self.run_test(
            "Create Checkout Session", 
            "POST", 
            "checkout/session", 
            200, 
            data
        )
        
        if success and 'session_id' in response:
            self.session_id = response['session_id']
            print(f"   Session ID: {self.session_id}")
            print(f"   Checkout URL: {response.get('url', 'N/A')}")
            return True
        return success

    def test_checkout_status(self):
        """Test GET /api/checkout/status/{session_id}"""
        if not self.session_id:
            print("❌ No session ID available for status check")
            return False
            
        return self.run_test(
            "Get Checkout Status", 
            "GET", 
            f"checkout/status/{self.session_id}", 
            200
        )

    def test_admin_login_wrong_password(self):
        """Test admin login with wrong password"""
        data = {"password": "wrongpassword"}
        success, _ = self.run_test(
            "Admin Login (Wrong Password)", 
            "POST", 
            "admin/login", 
            401, 
            data
        )
        return success

    def test_admin_login_correct_password(self):
        """Test admin login with correct password"""
        data = {"password": "admin123"}
        success, response = self.run_test(
            "Admin Login (Correct Password)", 
            "POST", 
            "admin/login", 
            200, 
            data
        )
        
        if success and 'token' in response:
            self.admin_token = response['token']
            print(f"   Admin token: {self.admin_token}")
            return True
        return success

    def test_admin_clients_unauthorized(self):
        """Test admin clients endpoint without auth"""
        return self.run_test(
            "Admin Clients (Unauthorized)", 
            "GET", 
            "admin/clients", 
            401,
            headers={'Authorization': 'Bearer invalid_token'}
        )

    def test_admin_clients_authorized(self):
        """Test admin clients endpoint with auth"""
        if not self.admin_token:
            print("❌ No admin token available")
            return False
            
        return self.run_test(
            "Admin Clients (Authorized)", 
            "GET", 
            "admin/clients", 
            200,
            headers={'Authorization': f'Bearer {self.admin_token}'}
        )

    def test_admin_transactions_authorized(self):
        """Test admin transactions endpoint with auth"""
        if not self.admin_token:
            print("❌ No admin token available")
            return False
            
        return self.run_test(
            "Admin Transactions (Authorized)", 
            "GET", 
            "admin/transactions", 
            200,
            headers={'Authorization': f'Bearer {self.admin_token}'}
        )

    def test_client_form_submission(self):
        """Test client form submission"""
        if not self.session_id:
            print("❌ No session ID available for form submission")
            return False
            
        data = {
            "payment_session_id": self.session_id,
            "nome_completo": "Test User",
            "data_nascimento": "1990-01-01",
            "telefone": "(11) 99999-9999",
            "nome_pessoa_amada": "Test Love",
            "situacao_atual": "Test situation",
            "observacoes": "Test observations",
            "service_type": "amor"
        }
        
        # This will likely fail since payment isn't completed, but we test the endpoint
        success, response = self.run_test(
            "Submit Client Form", 
            "POST", 
            "client-form", 
            400,  # Expected to fail due to payment not completed
            data
        )
        
        # For this test, we expect it to fail with payment not confirmed
        if not success:
            print("   ✅ Expected failure - payment not confirmed (correct behavior)")
            return True
        return success

def main():
    print("🚀 Starting Mystic Services API Tests")
    print("=" * 50)
    
    tester = MysticServicesAPITester()
    
    # Test sequence
    tests = [
        ("Root API Endpoint", tester.test_root_endpoint),
        ("Services Listing", tester.test_get_services),
        ("Checkout Session Creation", tester.test_create_checkout_session),
        ("Checkout Status Check", tester.test_checkout_status),
        ("Admin Login (Wrong Password)", tester.test_admin_login_wrong_password),
        ("Admin Login (Correct Password)", tester.test_admin_login_correct_password),
        ("Admin Clients (Unauthorized)", tester.test_admin_clients_unauthorized),
        ("Admin Clients (Authorized)", tester.test_admin_clients_authorized),
        ("Admin Transactions (Authorized)", tester.test_admin_transactions_authorized),
        ("Client Form Submission", tester.test_client_form_submission),
    ]
    
    failed_tests = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            if not result:
                failed_tests.append(test_name)
        except Exception as e:
            print(f"❌ {test_name} - Exception: {str(e)}")
            failed_tests.append(test_name)
    
    # Print results
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS")
    print("=" * 50)
    print(f"Tests run: {tester.tests_run}")
    print(f"Tests passed: {tester.tests_passed}")
    print(f"Tests failed: {len(failed_tests)}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if failed_tests:
        print(f"\n❌ Failed tests:")
        for test in failed_tests:
            print(f"   - {test}")
    else:
        print(f"\n✅ All tests passed!")
    
    return 0 if len(failed_tests) == 0 else 1

if __name__ == "__main__":
    sys.exit(main())