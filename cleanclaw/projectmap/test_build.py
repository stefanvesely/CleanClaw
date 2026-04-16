import json
import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(__file__))

from classifier import classify_file
from extractor import extract_methods, embed_text_for_method, embed_text_for_misc


class TestClassifier(unittest.TestCase):
    def test_backend_by_path(self):
        self.assertEqual(classify_file('src/services/UserService.ts', {}, {}), 'backend')

    def test_frontend_by_path(self):
        self.assertEqual(classify_file('src/components/Button.tsx', {}, {}), 'frontend')

    def test_mediator_by_path(self):
        self.assertEqual(classify_file('src/controllers/ApiController.ts', {}, {}), 'mediator')

    def test_misc_fallback(self):
        self.assertEqual(classify_file('README.md', {}, {}), 'misc')

    def test_layer_map_override(self):
        layer_map = {'src/custom/': 'frontend'}
        self.assertEqual(classify_file('src/custom/Foo.ts', layer_map, {}), 'frontend')

    def test_extra_keyword_override(self):
        keywords = {'backend': ['warehouse']}
        self.assertEqual(classify_file('src/warehouse/stock.ts', {}, keywords), 'backend')


class TestExtractor(unittest.TestCase):
    def test_extract_typescript_function(self):
        content = 'export function greet(name: string): string {\n  return `Hello ${name}`;\n}\n'
        with tempfile.NamedTemporaryFile(suffix='.ts', mode='w', delete=False) as f:
            f.write(content)
            tmp = f.name
        try:
            rows = extract_methods(tmp, 'src/greet.ts')
            self.assertTrue(any(r['method_name'] == 'greet' for r in rows))
        finally:
            os.unlink(tmp)

    def test_embed_text_for_method(self):
        row = {'method_name': 'doThing', 'signature': 'doThing(x: number): void',
               'output': 'void', 'filename': 'src/foo.ts', 'metadata': '', 'algorithm': ''}
        text = embed_text_for_method(row)
        self.assertIn('doThing', text)
        self.assertIn('src/foo.ts', text)

    def test_embed_text_for_misc(self):
        row = {'method_name': 'README.md', 'filename': 'README.md',
               'metadata': 'docs', 'algorithm': ''}
        text = embed_text_for_misc(row)
        self.assertIn('README.md', text)


if __name__ == '__main__':
    unittest.main()
