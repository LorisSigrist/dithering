precision highp float;
varying vec2 fragCoord;

uniform sampler2D uSampler;
uniform sampler2D uNoiseSampler;
uniform sampler2D uPaletteSampler;
uniform vec2 uNoiseSamplerSize;

uniform float uNoise;

uniform vec2 uSize;

//Each channel ranges from 0-1 
vec3 samplePalette(vec3 glsl_color) {

    vec3 scaledColor = floor(glsl_color * 255.0); //Scale the color to 0-255
    vec3 quantized_color = floor(scaledColor / 16.0) * 16.0; //Quantize the color to 16 steps

    float mappingI = floor(
        (
            floor(quantized_color.r) + 
            floor(quantized_color.g * 16.0) + 
            floor(quantized_color.b * 16.0 * 16.0)
        ) / 16.0
    );


    float mappedX = floor(mappingI / 64.0);
    float mappedY = floor(mod(mappingI, 64.0));
    

    //Map the pixel to the texture coordinates (64x64)
    float halfPixel = 0.5 / 64.0; //bilinear filtering fucks you without this
    vec2 uv = vec2(
        (mappedX / 64.0) + halfPixel,
        1.0 - (mappedY / 64.0) - halfPixel //correct for the texture being upside down
    );


    return texture2D(uPaletteSampler, uv).rgb;
}

void main(void) {
    //Map the current image pixel to the noise texture
    vec2 imgPixel = vec2(fragCoord.x * uSize.x, fragCoord.y * uSize.y);
    vec2 noisePixel = vec2( mod(imgPixel.x, uNoiseSamplerSize.x),  mod(imgPixel.y, uNoiseSamplerSize.y));
    
    vec2 noiseUV = vec2(noisePixel.x / uNoiseSamplerSize.x, noisePixel.y / uNoiseSamplerSize.y);
    float noise = (texture2D(uNoiseSampler, noiseUV).r - 0.5) * 2.0 * uNoise;

    vec4 color = texture2D(uSampler, fragCoord); //Get pixel color from the original image

    //clamp the color to 0-1
    color.r = clamp(color.r + noise, 0.0, 1.0);
    color.g = clamp(color.g + noise, 0.0, 1.0);
    color.b = clamp(color.b + noise, 0.0, 1.0);

    color.rgb = samplePalette(color.rgb); //Sample the palette


    gl_FragColor = color;
    //gl_FragColor = texture2D(uPaletteSampler, fragCoord);
}