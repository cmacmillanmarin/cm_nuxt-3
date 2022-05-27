precision highp float;

varying vec2 vUv;
varying float vWave;

uniform float uVid;
uniform vec2 uSize;
uniform float uMask;
uniform vec2 uTextureSize;
uniform float uOpacity;
uniform sampler2D uTexture;
uniform sampler2D uTextureVideo;
uniform float uZoom;

mat2 scaleMatrix(vec2 scale){
    return mat2(scale.x, 0.0, 0.0, scale.y);
}

void main() {

    vec2 uv = vUv;
    vec2 zoom = vec2( uZoom );

    vec2 s = uSize;               // Plane size
    vec2 i = uTextureSize;        // Texture size cropped
    float rs = s.x / s.y;
    float ri = i.x / i.y;
    vec2 new = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
    vec2 offset = (rs < ri ? vec2((new.x - s.x) / 2.0, 0.0) : vec2(0.0, (new.y - s.y) / 2.0)) / new;
    uv = vUv * s / new + offset;
    uv -= vec2(0.5);
    uv = scaleMatrix(zoom) * uv;
    uv += vec2(0.5);
    // uv.y = uv.y - .33 * uMask;

    gl_FragColor = vec4(mix(texture2D(uTexture, uv + vWave).rgb, texture2D(uTextureVideo, uv + vWave).rgb, uVid), step(uMask, uv.y));
}
