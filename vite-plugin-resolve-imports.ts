import { Plugin } from 'vite';
import path from 'path';

export default function resolveImportsPlugin(): Plugin {
  return {
    name: 'resolve-imports',
    resolveId(source, importer) {
      // Only handle relative imports
      if (!source.startsWith('./') && !source.startsWith('../')) {
        return null;
      }

      // Check if the import can be resolved with .tsx or .ts extension
      const resolveExtensions = ['.tsx', '.ts', '.jsx', '.js'];
      for (const ext of resolveExtensions) {
        const resolved = path.resolve(path.dirname(importer || ''), source + ext);
        try {
          // Check if file exists
          require.resolve(resolved);
          return resolved;
        } catch {
          continue;
        }
      }

      return null;
    }
  };
}
