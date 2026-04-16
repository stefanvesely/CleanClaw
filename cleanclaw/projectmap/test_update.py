import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(__file__))

import numpy as np
from store import load_table, remove_file_rows, save_table


class TestStore(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()

    def tearDown(self):
        import shutil
        shutil.rmtree(self.tmp)

    def _make_rows(self):
        return [
            {'method_name': 'foo', 'filename': 'src/a.ts', 'full_path': '/p/src/a.ts',
             'signature': 'foo(): void', 'output': 'void', 'metadata': '', 'algorithm': ''},
            {'method_name': 'bar', 'filename': 'src/b.ts', 'full_path': '/p/src/b.ts',
             'signature': 'bar(): string', 'output': 'string', 'metadata': '', 'algorithm': ''},
        ]

    def test_save_and_load_roundtrip(self):
        rows = self._make_rows()
        vectors = np.random.rand(len(rows), 8).astype('float32')
        save_table(self.tmp, 'backend', rows, vectors)
        _, loaded_rows = load_table(self.tmp, 'backend')
        self.assertEqual(len(loaded_rows), 2)
        self.assertEqual(loaded_rows[0]['method_name'], 'foo')

    def test_remove_file_rows_filters_correctly(self):
        rows = self._make_rows()
        vectors = np.random.rand(len(rows), 8).astype('float32')
        save_table(self.tmp, 'backend', rows, vectors)
        kept, positions = remove_file_rows(self.tmp, 'backend', '/p/src/a.ts')
        self.assertEqual(len(kept), 1)
        self.assertEqual(kept[0]['filename'], 'src/b.ts')
        self.assertEqual(positions, [1])

    def test_remove_file_rows_no_match(self):
        rows = self._make_rows()
        vectors = np.random.rand(len(rows), 8).astype('float32')
        save_table(self.tmp, 'backend', rows, vectors)
        kept, _ = remove_file_rows(self.tmp, 'backend', '/p/src/nonexistent.ts')
        self.assertEqual(len(kept), 2)


if __name__ == '__main__':
    unittest.main()
