import {Config} from '@remotion/cli/config';

// No GPU in the render container: WebGL runs on SwiftShader through ANGLE.
Config.setChromiumOpenGlRenderer('swangle');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(16);
Config.setPixelFormat('yuv420p');
