#!/usr/bin/env python3
# /// script
# requires-python = ">=3.9"
# dependencies = ["google-genai", "python-dotenv", "pillow"]
# ///
"""
Google Gemini Image Generation utility using Nano Banana & Nano Banana Pro.

Nano Banana refers to Gemini's image generation capabilities:
- Nano Banana: gemini-2.5-flash-image (fast, efficient)
- Nano Banana Pro: gemini-3-pro-image-preview (highest quality, up to 4K)

Features:
- Generate images from text prompts
- Use reference images for style/context (up to 14 images)
- Support for multiple aspect ratios and sizes
- Save images with SynthID watermark included
- Batch generation support

Usage:
    # Simple generation
    uv run generate-image.py --prompt "A sunset over mountains"

    # With reference images
    uv run generate-image.py --prompt "Product photo" --reference product.jpg logo.png

    # High quality 4K
    uv run generate-image.py --prompt "Detailed cityscape" --model pro --size 4K

    # Custom aspect ratio
    uv run generate-image.py --prompt "Banner design" --aspect 21:9 --size 2K

    # Multiple variations
    uv run generate-image.py --prompt "Logo design" --count 3

Models:
    flash       Gemini 2.5 Flash Image (Nano Banana) - Fast, efficient
    pro         Gemini 3 Pro Image Preview (Nano Banana Pro) - Highest quality

Aspect Ratios:
    1:1         Square (default)
    2:3         Portrait
    3:2         Landscape
    16:9        Widescreen
    21:9        Ultra-wide

Image Sizes:
    1K          1024x1024 (1:1), 1408x1024 (16:9), etc.
    2K          2048x2048 (1:1), 2816x2048 (16:9), etc. (default)
    4K          4096x4096 (1:1), 5632x4096 (16:9), etc. (Pro only)
"""

import argparse
import base64
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Dict, Any

# Try to import required libraries
try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

try:
    from dotenv import load_dotenv
    DOTENV_AVAILABLE = True
except ImportError:
    DOTENV_AVAILABLE = False

try:
    from PIL import Image
    import io
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

# Configuration
# These will be set relative to the project root (where .env is found)
OUTPUT_DIR = Path("generated_images")
CONFIG_FILE = Path(".image-gen-config.json")
PROJECT_ROOT = None  # Will be set by load_env()

DEFAULT_CONFIG = {
    "default_model": "flash",
    "default_aspect_ratio": "1:1",
    "default_size": "2K",
    "output_directory": "generated_images",
    "save_metadata": True,
    "auto_open": False
}

# Model mappings
MODEL_NAMES = {
    "flash": "gemini-2.5-flash-image",
    "pro": "gemini-3-pro-image-preview"
}

VALID_ASPECT_RATIOS = ["1:1", "2:3", "3:2", "16:9", "21:9"]
VALID_SIZES = ["1K", "2K", "4K"]


def load_env():
    """Load environment variables from .env file with multiple fallback locations."""
    global PROJECT_ROOT

    if DOTENV_AVAILABLE:
        # Try multiple .env locations in order of preference
        env_locations = [
            Path.cwd() / ".env",                    # Current directory
            Path(__file__).parent / ".env",         # Script directory
            Path.home() / ".env",                   # Home directory
        ]

        env_loaded = False
        for env_path in env_locations:
            if env_path.exists():
                load_dotenv(env_path)
                # Set PROJECT_ROOT to the directory containing .env
                PROJECT_ROOT = env_path.parent.resolve()
                env_loaded = True
                break

        if not env_loaded:
            # Try default load_dotenv() which searches up directory tree
            load_dotenv()
            # Default to script directory if no .env found
            PROJECT_ROOT = Path(__file__).parent.resolve()
    else:
        # No dotenv, default to script directory
        PROJECT_ROOT = Path(__file__).parent.resolve()

    # Try GOOGLE_API_KEY first, then GEMINI_API_KEY
    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")

    if not api_key:
        print("=" * 60, file=sys.stderr)
        print("ERROR: API Key Not Found", file=sys.stderr)
        print("=" * 60, file=sys.stderr)
        print("\nNo GOOGLE_API_KEY or GEMINI_API_KEY found.", file=sys.stderr)
        print("\nTo fix this, either:", file=sys.stderr)
        print("  1. Create a .env file with: GOOGLE_API_KEY=your_key_here", file=sys.stderr)
        print("  2. Export directly: export GOOGLE_API_KEY=your_key_here", file=sys.stderr)
        print("\nGet your API key at: https://aistudio.google.com/apikey", file=sys.stderr)
        print("=" * 60, file=sys.stderr)
        sys.exit(1)

    # Set GEMINI_API_KEY for the SDK (it prefers this variable)
    if not os.getenv("GEMINI_API_KEY"):
        os.environ["GEMINI_API_KEY"] = api_key

    return api_key


def load_config() -> dict:
    """Load configuration from file."""
    if CONFIG_FILE.exists():
        try:
            with open(CONFIG_FILE, 'r') as f:
                config = json.load(f)
                return {**DEFAULT_CONFIG, **config}
        except json.JSONDecodeError:
            print(f"Warning: Invalid JSON in {CONFIG_FILE}", file=sys.stderr)
    return DEFAULT_CONFIG


def save_config(config: dict):
    """Save configuration to file."""
    with open(CONFIG_FILE, 'w') as f:
        json.dump(config, f, indent=2)
    print(f"Configuration saved to {CONFIG_FILE}")


def load_image_as_base64(image_path: str) -> tuple[str, str]:
    """Load image file and convert to base64."""
    path = Path(image_path)
    if not path.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")

    # Determine MIME type
    mime_types = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
    }

    mime_type = mime_types.get(path.suffix.lower(), 'image/jpeg')

    # Read and encode
    with open(path, 'rb') as f:
        image_data = base64.b64encode(f.read()).decode('utf-8')

    return mime_type, image_data


def save_image(image_data: bytes, output_dir: Path, prefix: str = "generated") -> Path:
    """Save generated image to file."""
    output_dir.mkdir(parents=True, exist_ok=True)

    # Generate filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{prefix}_{timestamp}.png"
    filepath = output_dir / filename

    # Handle counter for multiple generations in same second
    counter = 1
    while filepath.exists():
        filename = f"{prefix}_{timestamp}_{counter}.png"
        filepath = output_dir / filename
        counter += 1

    with open(filepath, 'wb') as f:
        f.write(image_data)

    return filepath


def save_metadata(filepath: Path, metadata: dict):
    """Save generation metadata as JSON."""
    meta_path = filepath.with_suffix('.json')
    with open(meta_path, 'w') as f:
        json.dump(metadata, f, indent=2)


def generate_image(
    prompt: str,
    api_key: str,
    model: str = "flash",
    aspect_ratio: str = "1:1",
    image_size: str = "2K",
    reference_images: Optional[List[str]] = None,
    output_text: bool = True
) -> Dict[str, Any]:
    """
    Generate image using Gemini API.

    Args:
        prompt: Text description of desired image
        api_key: Google API key
        model: Model to use ('flash' or 'pro')
        aspect_ratio: Desired aspect ratio
        image_size: Image size (1K, 2K, or 4K)
        reference_images: Optional list of reference image paths
        output_text: Whether to include text description in response

    Returns:
        Dictionary containing generated image data and metadata
    """
    if not GENAI_AVAILABLE:
        raise ImportError("google-genai not available. Install with: pip install google-genai")

    # Validate parameters
    if aspect_ratio not in VALID_ASPECT_RATIOS:
        raise ValueError(f"Invalid aspect ratio. Must be one of: {VALID_ASPECT_RATIOS}")

    if image_size not in VALID_SIZES:
        raise ValueError(f"Invalid image size. Must be one of: {VALID_SIZES}")

    if image_size == "4K" and model != "pro":
        print("Warning: 4K only available with Pro model. Switching to Pro...", file=sys.stderr)
        model = "pro"

    model_name = MODEL_NAMES.get(model, MODEL_NAMES["flash"])

    # Initialize client (will use GEMINI_API_KEY from environment)
    client = genai.Client(api_key=api_key)

    # Build content - use simple string for text-only, list for with images
    if reference_images:
        content_parts = []
        print(f"Loading {len(reference_images)} reference image(s)...")
        for img_path in reference_images:
            try:
                # Load image file directly using PIL
                from PIL import Image as PILImage
                img = PILImage.open(img_path)
                content_parts.append(img)
                print(f"  ✓ Loaded: {img_path}")
            except Exception as e:
                print(f"  ✗ Failed to load {img_path}: {e}", file=sys.stderr)

        # Add text prompt last
        content_parts.append(prompt)
        contents = content_parts
    else:
        # Simple text prompt
        contents = prompt

    # Build generation config
    response_modalities = ['IMAGE']
    if output_text:
        response_modalities.insert(0, 'TEXT')

    # Build image config - aspect_ratio only (image_size not universally supported)
    config = types.GenerateContentConfig(
        response_modalities=response_modalities,
        image_config=types.ImageConfig(
            aspect_ratio=aspect_ratio
        )
    )

    # Generate
    print(f"\nGenerating with {model_name}...")
    print(f"Prompt: {prompt}")
    print(f"Aspect ratio: {aspect_ratio}, Size: {image_size}")

    try:
        response = client.models.generate_content(
            model=model_name,
            contents=contents,
            config=config
        )

        # Extract results
        result = {
            "text": None,
            "images": [],
            "metadata": {
                "prompt": prompt,
                "model": model_name,
                "aspect_ratio": aspect_ratio,
                "image_size": image_size,
                "reference_images": reference_images or [],
                "timestamp": datetime.now().isoformat()
            }
        }

        # Process response parts
        for part in response.parts:
            if part.text is not None:
                result["text"] = part.text
                print(f"\nDescription: {part.text}")

            if part.inline_data is not None:
                image_data = None

                # Method 1: Try raw inline_data.data (most reliable)
                try:
                    if hasattr(part.inline_data, 'data') and part.inline_data.data:
                        raw_data = part.inline_data.data
                        if isinstance(raw_data, bytes):
                            image_data = raw_data
                        elif isinstance(raw_data, str):
                            # Base64 encoded string
                            image_data = base64.b64decode(raw_data)
                except Exception as e:
                    print(f"Note: Raw data extraction failed ({e})", file=sys.stderr)

                # Method 2: Try as_image() with proper PIL handling
                if image_data is None:
                    try:
                        pil_image = part.as_image()
                        img_byte_arr = io.BytesIO()
                        # Use positional argument for format to avoid keyword issues
                        pil_image.save(img_byte_arr, "PNG")
                        image_data = img_byte_arr.getvalue()
                    except Exception as e:
                        print(f"Note: as_image() method failed ({e})", file=sys.stderr)

                # Method 3: Try _image_bytes if available (some SDK versions)
                if image_data is None:
                    try:
                        if hasattr(part, '_image_bytes'):
                            image_data = part._image_bytes
                    except Exception as e:
                        pass

                if image_data:
                    result["images"].append(image_data)
                else:
                    print("Warning: Could not extract image data from response part", file=sys.stderr)

        return result

    except Exception as e:
        error_msg = str(e)

        # Provide helpful error messages for common issues
        if "API_KEY_INVALID" in error_msg or "API key expired" in error_msg:
            print("\n" + "=" * 60, file=sys.stderr)
            print("ERROR: Invalid or Expired API Key", file=sys.stderr)
            print("=" * 60, file=sys.stderr)
            print("\nYour Google API key is invalid or has expired.", file=sys.stderr)
            print("\nTo fix this:", file=sys.stderr)
            print("  1. Go to: https://aistudio.google.com/apikey", file=sys.stderr)
            print("  2. Create a new API key (or regenerate existing one)", file=sys.stderr)
            print("  3. Update your .env file: GOOGLE_API_KEY=new_key_here", file=sys.stderr)
            print("=" * 60, file=sys.stderr)
        elif "PERMISSION_DENIED" in error_msg:
            print("\n" + "=" * 60, file=sys.stderr)
            print("ERROR: Permission Denied", file=sys.stderr)
            print("=" * 60, file=sys.stderr)
            print("\nYour API key doesn't have access to image generation.", file=sys.stderr)
            print("Ensure image generation is enabled in your Google AI project.", file=sys.stderr)
            print("=" * 60, file=sys.stderr)
        elif "RESOURCE_EXHAUSTED" in error_msg or "quota" in error_msg.lower():
            print("\n" + "=" * 60, file=sys.stderr)
            print("ERROR: Quota Exhausted", file=sys.stderr)
            print("=" * 60, file=sys.stderr)
            print("\nYou've exceeded your API quota.", file=sys.stderr)
            print("Wait a few minutes or check your billing at:", file=sys.stderr)
            print("  https://console.cloud.google.com/billing", file=sys.stderr)
            print("=" * 60, file=sys.stderr)
        elif "INVALID_ARGUMENT" in error_msg:
            print("\n" + "=" * 60, file=sys.stderr)
            print("ERROR: Invalid Request", file=sys.stderr)
            print("=" * 60, file=sys.stderr)
            print(f"\nThe API rejected the request: {error_msg}", file=sys.stderr)
            print("\nThis might be due to:", file=sys.stderr)
            print("  - Content policy violation in prompt", file=sys.stderr)
            print("  - Invalid image reference format", file=sys.stderr)
            print("  - Unsupported aspect ratio/size combination", file=sys.stderr)
            print("=" * 60, file=sys.stderr)
        else:
            print(f"\nError generating image: {e}", file=sys.stderr)

        raise


def setup_wizard():
    """Interactive setup wizard."""
    print("=" * 60)
    print("Gemini Image Generation Setup")
    print("=" * 60)
    print()

    config = load_config()

    # API Key
    print("API Key Configuration")
    print("-" * 60)
    api_key = os.getenv("GOOGLE_API_KEY")
    if api_key:
        print(f"✓ GOOGLE_API_KEY found in environment")
        print(f"  Key: {api_key[:10]}...{api_key[-4:]}")
    else:
        print("✗ GOOGLE_API_KEY not found")
        print("\nCreate an API key at: https://aistudio.google.com/apikey")
        print("Then add to .env file: GOOGLE_API_KEY=your_key_here")

    # Model preference
    print("\n" + "=" * 60)
    print("Default Model")
    print("-" * 60)
    print("flash - Gemini 2.5 Flash Image (Fast, efficient)")
    print("pro   - Gemini 3 Pro Image (Highest quality, 4K support)")
    current_model = config.get("default_model", "flash")
    print(f"\nCurrent: {current_model}")
    model = input("Default model [flash/pro] (Enter to keep): ").strip().lower()
    if model in ["flash", "pro"]:
        config["default_model"] = model

    # Aspect ratio
    print("\n" + "=" * 60)
    print("Default Aspect Ratio")
    print("-" * 60)
    print("Options: " + ", ".join(VALID_ASPECT_RATIOS))
    current_ratio = config.get("default_aspect_ratio", "1:1")
    print(f"Current: {current_ratio}")
    ratio = input("Default aspect ratio (Enter to keep): ").strip()
    if ratio in VALID_ASPECT_RATIOS:
        config["default_aspect_ratio"] = ratio

    # Image size
    print("\n" + "=" * 60)
    print("Default Image Size")
    print("-" * 60)
    print("Options: " + ", ".join(VALID_SIZES))
    current_size = config.get("default_size", "2K")
    print(f"Current: {current_size}")
    size = input("Default size (Enter to keep): ").strip().upper()
    if size in VALID_SIZES:
        config["default_size"] = size

    # Output directory
    print("\n" + "=" * 60)
    print("Output Directory")
    print("-" * 60)
    current_dir = config.get("output_directory", "generated_images")
    print(f"Current: {current_dir}")
    output = input("Output directory (Enter to keep): ").strip()
    if output:
        config["output_directory"] = output

    save_config(config)

    print("\n" + "=" * 60)
    print("✅ Configuration saved!")
    print(f"Config file: {CONFIG_FILE}")
    print("\nTest with: uv run generate-image.py --test")
    print("=" * 60)


def test_generation(api_key: str, config: dict):
    """Test image generation with sample prompt."""
    print("Testing Gemini image generation...")
    print()

    test_prompt = "A friendly robot waving hello, digital art style"

    try:
        result = generate_image(
            prompt=test_prompt,
            api_key=api_key,
            model=config.get("default_model", "flash"),
            aspect_ratio=config.get("default_aspect_ratio", "1:1"),
            image_size=config.get("default_size", "2K")
        )

        if result["images"]:
            # Use PROJECT_ROOT for consistent output location
            default_output = config.get("output_directory", "generated_images")
            output_dir = (PROJECT_ROOT / default_output) if PROJECT_ROOT else Path(default_output)
            filepath = save_image(result["images"][0], output_dir, "test")
            print(f"\n✅ Test successful!")
            print(f"Image saved to: {filepath}")

            if config.get("save_metadata", True):
                save_metadata(filepath, result["metadata"])
                print(f"Metadata saved to: {filepath.with_suffix('.json')}")
        else:
            print("✗ No image generated", file=sys.stderr)

    except Exception as e:
        print(f"✗ Test failed: {e}", file=sys.stderr)


def main():
    parser = argparse.ArgumentParser(
        description="Generate images using Google Gemini (Nano Banana & Nano Banana Pro)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )

    # Setup and testing
    parser.add_argument("--setup", action="store_true", help="Run setup wizard")
    parser.add_argument("--test", action="store_true", help="Test with sample generation")
    parser.add_argument("--status", action="store_true", help="Show configuration status")

    # Generation options
    parser.add_argument("--prompt", "-p", help="Text prompt describing desired image")
    parser.add_argument(
        "--model", "-m",
        choices=["flash", "pro"],
        help="Model to use (flash=2.5-flash, pro=3-pro-preview)"
    )
    parser.add_argument(
        "--aspect", "-a",
        choices=VALID_ASPECT_RATIOS,
        help="Aspect ratio"
    )
    parser.add_argument(
        "--size", "-s",
        choices=VALID_SIZES,
        help="Image size (4K requires pro model)"
    )
    parser.add_argument(
        "--reference", "-r",
        nargs="+",
        help="Reference image paths (up to 14 images)"
    )
    parser.add_argument(
        "--output", "-o",
        help="Output directory (overrides config)"
    )
    parser.add_argument(
        "--count", "-c",
        type=int,
        default=1,
        help="Number of variations to generate"
    )
    parser.add_argument(
        "--prefix",
        default="generated",
        help="Output filename prefix"
    )
    parser.add_argument(
        "--no-text",
        action="store_true",
        help="Don't include text description in output"
    )
    parser.add_argument(
        "--no-metadata",
        action="store_true",
        help="Don't save metadata JSON files"
    )

    args = parser.parse_args()

    # Load configuration
    config = load_config()

    # Handle setup commands
    if args.setup:
        setup_wizard()
        return

    if args.status:
        print("Gemini Image Generation Status")
        print("=" * 60)

        # Check for .env file locations
        print("\n📁 Environment Files:")
        env_locations = [
            (Path.cwd() / ".env", "Current directory"),
            (Path(__file__).parent / ".env", "Script directory"),
            (Path.home() / ".env", "Home directory"),
        ]
        env_found = False
        for env_path, desc in env_locations:
            if env_path.exists():
                print(f"  ✓ Found: {env_path} ({desc})")
                env_found = True
                # Load it to check for API key
                if DOTENV_AVAILABLE:
                    load_dotenv(env_path)
                break
        if not env_found:
            print("  ✗ No .env file found")
            print(f"    Create one at: {Path.cwd() / '.env'}")

        # API Key status
        print(f"\n🔑 API Key:")
        api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
        if api_key:
            print(f"  ✓ Configured ({api_key[:8]}...{api_key[-4:]})")
            key_source = "GOOGLE_API_KEY" if os.getenv("GOOGLE_API_KEY") else "GEMINI_API_KEY"
            print(f"    Source: {key_source}")
        else:
            print("  ✗ Not found")
            print("    Set GOOGLE_API_KEY in .env file")
            print("    Get key at: https://aistudio.google.com/apikey")

        # Config file
        print(f"\n⚙️  Config file: {CONFIG_FILE}")
        if CONFIG_FILE.exists():
            print("  ✓ Exists")
        else:
            print("  (using defaults)")

        print(f"\n📐 Defaults:")
        print(f"  Model: {config.get('default_model', 'flash')}")
        print(f"  Aspect ratio: {config.get('default_aspect_ratio', '1:1')}")
        print(f"  Size: {config.get('default_size', '2K')}")
        print(f"  Output: {config.get('output_directory', 'generated_images')}/")

        print(f"\n📦 Libraries:")
        print(f"  google-genai: {'✓' if GENAI_AVAILABLE else '✗ (uv add google-genai)'}")
        print(f"  python-dotenv: {'✓' if DOTENV_AVAILABLE else '✗ (uv add python-dotenv)'}")
        print(f"  Pillow: {'✓' if PIL_AVAILABLE else '✗ (uv add pillow)'}")

        print(f"\n💡 Quick Start:")
        print('  uv run generate-image.py --prompt "A sunset over mountains"')
        print('  uv run generate-image.py --prompt "Logo design" --model pro --size 4K')
        print("=" * 60)
        return

    # Load API key
    try:
        api_key = load_env()
    except SystemExit:
        return

    if args.test:
        test_generation(api_key, config)
        return

    # Require prompt for generation
    if not args.prompt:
        parser.print_help()
        print("\nError: --prompt is required for image generation", file=sys.stderr)
        return

    # Apply defaults from config
    model = args.model or config.get("default_model", "flash")
    aspect_ratio = args.aspect or config.get("default_aspect_ratio", "1:1")
    image_size = args.size or config.get("default_size", "2K")

    # Determine output directory - use PROJECT_ROOT to ensure images go to the right place
    if args.output:
        # User specified explicit output - use as-is if absolute, else relative to PROJECT_ROOT
        output_path = Path(args.output)
        if output_path.is_absolute():
            output_dir = output_path
        else:
            output_dir = (PROJECT_ROOT / output_path) if PROJECT_ROOT else output_path
    else:
        # Default: always use PROJECT_ROOT/generated_images for gallery integration
        default_output = config.get("output_directory", "generated_images")
        output_dir = (PROJECT_ROOT / default_output) if PROJECT_ROOT else Path(default_output)

    # Validate reference images count
    if args.reference and len(args.reference) > 14:
        print("Warning: Maximum 14 reference images supported. Using first 14...", file=sys.stderr)
        args.reference = args.reference[:14]

    # Generate images
    print("=" * 60)
    print("Gemini Image Generation")
    print("=" * 60)

    for i in range(args.count):
        if args.count > 1:
            print(f"\nGenerating variation {i+1}/{args.count}...")

        try:
            result = generate_image(
                prompt=args.prompt,
                api_key=api_key,
                model=model,
                aspect_ratio=aspect_ratio,
                image_size=image_size,
                reference_images=args.reference,
                output_text=not args.no_text
            )

            # Save images
            for idx, image_data in enumerate(result["images"]):
                prefix = args.prefix
                if args.count > 1:
                    prefix = f"{prefix}_v{i+1}"
                if len(result["images"]) > 1:
                    prefix = f"{prefix}_img{idx+1}"

                filepath = save_image(image_data, output_dir, prefix)
                print(f"\n✅ Image saved: {filepath}")

                # Save metadata
                if not args.no_metadata and config.get("save_metadata", True):
                    metadata = {**result["metadata"], "description": result.get("text")}
                    save_metadata(filepath, metadata)
                    print(f"   Metadata: {filepath.with_suffix('.json')}")

            if not result["images"]:
                print("⚠️  No images generated", file=sys.stderr)

        except Exception as e:
            print(f"✗ Generation failed: {e}", file=sys.stderr)
            continue

    print("\n" + "=" * 60)
    print("✅ Generation complete!")
    print(f"Output directory: {output_dir}/")
    print("=" * 60)


if __name__ == "__main__":
    main()
