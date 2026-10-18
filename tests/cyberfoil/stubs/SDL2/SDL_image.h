// Host stub of IMG_Load. The loader only asks whether an image decodes and
// how big it is, so this reads the PNG IHDR and nothing else: a file without
// the PNG signature "fails to decode", which is the case the loader guards.
#pragma once
#include <cstdio>
#include <cstdint>

struct SDL_Surface { int w; int h; };

inline SDL_Surface* IMG_Load(const char* file) {
    FILE* f = std::fopen(file, "rb");
    if (!f) return nullptr;
    unsigned char head[24] = {0};
    const size_t got = std::fread(head, 1, sizeof head, f);
    std::fclose(f);
    static const unsigned char sig[8] = {0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A};
    if (got < 24) return nullptr;
    for (int i = 0; i < 8; i++) if (head[i] != sig[i]) return nullptr;
    auto be = [&](int o) { return (int)((uint32_t)head[o] << 24 | (uint32_t)head[o + 1] << 16 | (uint32_t)head[o + 2] << 8 | head[o + 3]); };
    return new SDL_Surface{be(16), be(20)};
}
inline void SDL_FreeSurface(SDL_Surface* s) { delete s; }
