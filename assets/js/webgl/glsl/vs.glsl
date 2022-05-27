precision highp float;

varying vec2 vUv;
varying float vWave;

uniform float uWave;
uniform float uProgress;
uniform float cAltitude;
uniform float cAmplitude;
uniform float cWireframes;
uniform float cX;
uniform float cY;

#define M_PI 3.1415926535897932384626433832795

void main() {

    vUv = uv;

    vec3 wavePosition = position;

    float dir = ((uv.x * cX) + ((1. - uv.y) * cY)) * 0.5;
    float progress = (1. - uWave);
    float amplitudeProgress = sin(M_PI * uWave);
    float left = cAltitude * smoothstep(progress - cAmplitude, progress, dir);
    float right = cAltitude * (1. - smoothstep(progress, progress + cAmplitude, dir));
    wavePosition.z = mix(left, right, step(progress, dir)) * uProgress * amplitudeProgress;
    vWave = wavePosition.z * -.00125;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(mix(position, wavePosition, cWireframes), 1.);
}
