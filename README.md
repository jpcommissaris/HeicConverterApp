# HEIC to JPEG/PNG Converter

Client only secure web app for converting HEIC/HEIF images to JPEG or PNG. No uploads, no servers - all processing happens locally on your device.


### Installation

```bash
pnpm install
pnpm dev
```

### Tech
- Typical Next.js, React stack w/ ShadCn
- For HEIC conversion: https://github.com/alexcorvi/heic2any

### Supported Formats

- Unlimited downloads. No uploads to any server -> because it happens on your client
- **Input**: HEIC, HEIF
- **Output**: JPEG, PNG

### Experiments - Claude Code:
- Generated all of the test setup, files & mocks
- Generated most of the SEO code. 
- Fixed some bugs around multiple files drag/drop at the same time.
