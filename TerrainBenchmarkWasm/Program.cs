using System;
using System.ComponentModel;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Runtime.InteropServices.JavaScript;
using System.Threading.Tasks;

Console.WriteLine("Hello, Browser!");

partial class TerrainGenerator
{
    static float[] buffer;
    static GCHandle bufferHandle;
    static FastNoiseLite noise;

    [JSExport]
    static IntPtr InitBuffer(int velikost)
    {
        // Init of a noise
        noise = new();
        noise.SetNoiseType(FastNoiseLite.NoiseType.OpenSimplex2);
        noise.SetSeed(2026);
        noise.SetFractalType(FastNoiseLite.FractalType.None);
        noise.SetFrequency(1);


        // Buffer init
        buffer = new float[velikost];
        bufferHandle = GCHandle.Alloc(buffer,GCHandleType.Pinned);
        return bufferHandle.AddrOfPinnedObject();
    }

    [JSExport]
    static void Generate(float time)
    {
        for (int i = 0; i < buffer.Length; i+=3)
        {
            float x,y,z;
            float scale = 0.02f;
            float amplitude = 4f;

            x = buffer[i];
            y = buffer[i + 1];
            z = 0;
            for (int j = 0; j < 4; j++)
            {
                float noiseRaw = noise.GetNoise(x * scale, (y*scale) + time);
                float ridge = 1.0f - MathF.Abs(noiseRaw);
                z+= (ridge * ridge) * amplitude;
                scale *= 2;
                amplitude /= 2;
            }
            float z_norm = (z / 7.5f);
            buffer[i+2] = MathF.Pow(z_norm,1.5f) * 20;
        }
    }
}