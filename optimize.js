import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir, unlink, mkdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const exportedDir = join(__dirname, 'blender', 'exported');
const outputDir = join(__dirname, 'public', 'models');

// Function to optimize a single file
async function optimizeFile(filename) {
  const inputPath = join(exportedDir, `${filename}.glb`);
  const optimPath = join(outputDir, `${filename}.optim.glb`);

  console.log(`\n[${filename}] Starting optimization...`);
  console.log(`[${filename}] Input: ${inputPath}`);
  console.log(`[${filename}] Output: ${optimPath}`);

  try {
    // Step 1: Prune unused data first (removes unnecessary data early)
    console.log(`[${filename}] Pruning unused data...`);
    execSync(`gltf-transform prune "${inputPath}" "${optimPath}"`, {
      stdio: 'inherit',
      cwd: __dirname
    });

    // Step 2: Resize textures (reduce resolution to max 128x128)
    console.log(`[${filename}] Resizing textures to max 128x128...`);
    execSync(`gltf-transform resize "${optimPath}" "${optimPath}" --width 128 --height 128`, {
      stdio: 'inherit',
      cwd: __dirname
    });

    // Step 3: Compress textures to WebP
    console.log(`[${filename}] Compressing textures to WebP...`);
    execSync(`gltf-transform webp "${optimPath}" "${optimPath}" --quality 80`, {
      stdio: 'inherit',
      cwd: __dirname
    });

    // Step 4: Quantize attributes (reduce precision)
    console.log(`[${filename}] Quantizing attributes...`);
    execSync(`gltf-transform quantize "${optimPath}" "${optimPath}"`, {
      stdio: 'inherit',
      cwd: __dirname
    });

    // Step 5: Simplify meshes (adjust ratio based on your needs)
    console.log(`[${filename}] Simplifying meshes...`);
    execSync(`gltf-transform simplify "${optimPath}" "${optimPath}" --ratio 0.7`, {
      stdio: 'inherit',
      cwd: __dirname
    });

    // Step 6: Deduplicate
    console.log(`[${filename}] Running dedup...`);
    execSync(`gltf-transform dedup "${optimPath}" "${optimPath}"`, {
      stdio: 'inherit',
      cwd: __dirname
    });

    // Step 7: Instance
    console.log(`[${filename}] Running instance...`);
    execSync(`gltf-transform instance "${optimPath}" "${optimPath}"`, {
      stdio: 'inherit',
      cwd: __dirname
    });

    // Step 8: Apply Meshopt compression (final step)
    console.log(`[${filename}] Applying Meshopt compression...`);
    execSync(`gltf-transform meshopt "${optimPath}" "${optimPath}"`, {
      stdio: 'inherit',
      cwd: __dirname
    });

    console.log(`[${filename}] ✓ Optimization complete!`);
    return true;
  } catch (error) {
    console.error(`[${filename}] ✗ Optimization failed:`, error.message);
    return false;
  }
}

// Get filename from command line arguments
const filename = process.argv[2];

if (!filename) {
  // Batch mode: optimize all .glb files
  console.log('Batch optimization mode');
  console.log('='.repeat(50));
  
  try {
    // Step 0: Ensure output directory exists
    await mkdir(outputDir, { recursive: true });

    // Step 1: Delete all .optim.glb files from output directory
    console.log('\nStep 1: Cleaning up existing optimized files...');
    let optimFiles = [];
    try {
      const outputFiles = await readdir(outputDir);
      optimFiles = outputFiles.filter(f => f.endsWith('.optim.glb'));
    } catch (error) {
      // Output directory might not exist yet, that's okay
      console.log('  Output directory does not exist yet, will be created.');
    }
    
    if (optimFiles.length === 0) {
      console.log('  No existing optimized files to clean up.');
    } else {
      console.log(`  Found ${optimFiles.length} optimized file(s) to delete:`);
      for (const file of optimFiles) {
        const filePath = join(outputDir, file);
        await unlink(filePath);
        console.log(`  ✓ Deleted: ${file}`);
      }
    }

    // Step 2: Find all .glb files (excluding .optim.glb)
    console.log('\nStep 2: Finding .glb files to optimize...');
    const files = await readdir(exportedDir);
    const glbFiles = files.filter(f => f.endsWith('.glb') && !f.endsWith('.optim.glb'));
    
    if (glbFiles.length === 0) {
      console.log('  No .glb files found to optimize.');
      process.exit(0);
    }

    console.log(`  Found ${glbFiles.length} file(s) to optimize:`);
    glbFiles.forEach(file => console.log(`    - ${file}`));

    // Step 3: Optimize each file
    console.log('\nStep 3: Optimizing files...');
    console.log('='.repeat(50));
    
    const results = [];
    for (let i = 0; i < glbFiles.length; i++) {
      const file = glbFiles[i];
      const baseName = file.replace('.glb', '');
      
      console.log(`\n[${i + 1}/${glbFiles.length}] Processing: ${file}`);
      const success = await optimizeFile(baseName);
      results.push({ file, success });
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('Optimization Summary:');
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`  Total files: ${results.length}`);
    console.log(`  ✓ Successful: ${successful}`);
    if (failed > 0) {
      console.log(`  ✗ Failed: ${failed}`);
      results.filter(r => !r.success).forEach(r => {
        console.log(`    - ${r.file}`);
      });
    }
    
    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('\n✗ Batch optimization failed:', error.message);
    process.exit(1);
  }
} else {
  // Single file mode
  try {
    await optimizeFile(filename);
  } catch (error) {
    console.error('\n✗ Optimization failed:', error.message);
    process.exit(1);
  }
}
