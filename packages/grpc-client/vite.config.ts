import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      outDir: 'dist',
      include: ['src/generated'],
      exclude: ['**/*.test.ts', '**/*.spec.ts'],
      copyDtsFiles: true,
      beforeWriteFile: (filePath, content) => {
        // Remove the 'generated' part from the path to output directly to dist/
        const newPath = filePath.replace('/generated/', '/');
        return { filePath: newPath, content };
      },
    }),
  ],
  build: {
    lib: {
      entry: {
        'grpc-js': resolve(__dirname, 'src/generated/grpc-js/index.ts'),
        'nice-grpc': resolve(__dirname, 'src/generated/nice-grpc/index.ts'),
        'proto': resolve(__dirname, 'src/generated/proto/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['@grpc/grpc-js', '@bufbuild/protobuf', 'nice-grpc-common'],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src/generated',
        entryFileNames: '[name].js',
      },
    },
    outDir: 'dist',
  },
});
