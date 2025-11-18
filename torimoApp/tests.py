import json
from django.test import TestCase, Client
from django.urls import reverse


class ApiUrlTests(TestCase):
	def test_reverse_nutrition_analyze(self):
		url = reverse('nutrition-analyze')
		# Expect the API to be mounted under /api/
		self.assertTrue(url.endswith('/api/nutrition/analyze/'))


class NutritionAnalyzeViewTests(TestCase):
	def setUp(self):
		self.client = Client()

	def test_post_nutrition_analyze_smoke(self):
		# Smoke test: endpoint exists and does not return 404
		url = reverse('nutrition-analyze')
		payload = {"text": "ご飯 150g, 鶏胸肉 100g, 卵 1個"}
		resp = self.client.post(url, data=json.dumps(payload), content_type='application/json')
		# Should not be 404; allow 200 or validation-related 4xx
		self.assertNotEqual(resp.status_code, 404)
		# If 200, ensure JSON-like structure
		if resp.status_code == 200:
			data = resp.json()
			self.assertIn('totals', data)
			self.assertIn('items', data)
