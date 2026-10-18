// Host stub of the slice of Plutonium that CyberFoil's source/util/theme.cpp
// touches. Only Color::FromHex carries behaviour, and it is copied from
// Plutonium's Source/pu/ui/ui_Types.cpp (luketanti/Plutonium f42b888) because
// the theme loader's results go through it.
#pragma once
#include <cstdint>
#include <memory>
#include <string>
#include <utility>
#include <vector>

using u8 = std::uint8_t;
using s32 = std::int32_t;
using u64 = std::uint64_t;

#define PU_SMART_CTOR(type) \
    using Ref = std::shared_ptr<type>; \
    template<typename ...Args> \
    static Ref New(Args &&...CtorArgs) { return std::make_shared<type>(std::forward<Args>(CtorArgs)...); }

namespace pu::ui {
    struct Color {
        u8 R = 0, G = 0, B = 0, A = 255;
        Color() = default;
        Color(u8 r, u8 g, u8 b, u8 a) : R(r), G(g), B(b), A(a) {}
        static Color FromHex(const std::string& HexFmt) {
            Color clr;
            std::string r = "00", g = "00", b = "00", a = "FF";
            if (HexFmt.length() >= 9) a = HexFmt.substr(7, 2);
            if (HexFmt.length() >= 7) { r = HexFmt.substr(1, 2); g = HexFmt.substr(3, 2); b = HexFmt.substr(5, 2); }
            clr.R = (u8)std::stoul(r, NULL, 16);
            clr.G = (u8)std::stoul(g, NULL, 16);
            clr.B = (u8)std::stoul(b, NULL, 16);
            clr.A = (u8)std::stoul(a, NULL, 16);
            return clr;
        }
    };

    namespace render { struct Renderer { using Ref = std::shared_ptr<Renderer>; }; }

    // Records what ApplyBackground asked for, so the dump can print it.
    class Layout {
    public:
        Color bg;
        std::string image;
        void SetBackgroundColor(Color c) { bg = c; }
        void SetBackgroundImage(const std::string& path) { image = path; }
    };
}
