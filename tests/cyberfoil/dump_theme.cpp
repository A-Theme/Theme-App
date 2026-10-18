/**
 * Prints what CyberFoil's theme loader decides for every case in cases.json,
 * as the reference the CyberFoil editor's JS port is held to.
 *
 * It compiles CyberFoil's own source/util/theme.cpp, unmodified, on the host:
 * the file is #included so the helpers in its anonymous namespace
 * (ParseColor, ValidManifestPath, ReadManifest, ManifestName) are reachable,
 * and stubs/ stands in for Plutonium, SDL2_image and libnx. Run from a
 * CyberFoil checkout (luketanti/CyberFoil):
 *
 *     g++ -std=c++17 -I../Theme-App/tests/cyberfoil/stubs -Iinclude -I. \
 *         ../Theme-App/tests/cyberfoil/dump_theme.cpp -o /tmp/dumpcf \
 *         && /tmp/dumpcf ../Theme-App/tests/cyberfoil/cases.json \
 *            > ../Theme-App/tests/cyberfoil/reference.txt
 *
 * Regenerate it when theme.cpp changes - a diff in reference.txt IS the
 * notification that the editor needs the same change.
 */
#include "source/util/theme.cpp"

#include <cstdio>
#include <cstdlib>
#include <iostream>
#include <map>

namespace fs = std::filesystem;
using nlohmann::json;
using namespace inst::theme;

static std::string g_app;

static std::string rgba(pu::ui::Color c) {
    return std::to_string(c.R) + "," + std::to_string(c.G) + "," + std::to_string(c.B) + "," + std::to_string(c.A);
}

// Machine-independent: the temp directory is printed as $APP.
static std::string rel(const std::string& path) {
    return path.rfind(g_app, 0) == 0 ? "$APP" + path.substr(g_app.size()) : path;
}

static void writeFile(const fs::path& path, const json& spec) {
    fs::create_directories(path.parent_path());
    std::ofstream out(path, std::ios::binary);
    if (spec.contains("json")) {
        out << spec["json"].dump();
    } else if (spec.contains("text")) {
        out << spec["text"].get<std::string>();
    } else if (spec.contains("head")) {
        const auto head = spec["head"].get<std::string>(), tail = spec["tail"].get<std::string>();
        out << head << std::string(spec["size"].get<size_t>() - head.size() - tail.size(), 'x') << tail;
    } else if (spec.contains("bytes")) {
        out << std::string(spec["bytes"].get<size_t>(), 'q');
    } else if (spec.contains("png")) {
        const unsigned w = spec["png"][0], h = spec["png"][1];
        const unsigned char sig[16] = {0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 13, 'I', 'H', 'D', 'R'};
        out.write(reinterpret_cast<const char*>(sig), 16);
        for (unsigned v : {w, h}) {
            const unsigned char be[4] = {(unsigned char)(v >> 24), (unsigned char)(v >> 16), (unsigned char)(v >> 8), (unsigned char)v};
            out.write(reinterpret_cast<const char*>(be), 4);
        }
        out << std::string(16, '\0');
    }
    out.close();
    if (spec.contains("png") && spec.contains("size")) fs::resize_file(path, spec["size"].get<size_t>());
}

int main(int argc, char** argv) {
    if (argc < 2) { std::cerr << "usage: dumpcf cases.json\n"; return 2; }
    std::ifstream in(argv[1]);
    const json cases = json::parse(in);

    char tmpl[] = "/tmp/cfthemeXXXXXX";
    if (!mkdtemp(tmpl)) return 1;
    g_app = tmpl;
    for (const auto& [name, spec] : cases["tree"].items()) writeFile(fs::path(g_app) / name, spec);

    // ReadManifest + ManifestName on every file in the tree.
    for (const auto& [name, spec] : cases["tree"].items()) {
        json root;
        const bool ok = ReadManifest(fs::path(g_app) / name, root);
        std::cout << "R|" << name << "|" << ok << "|" << (ok ? ManifestName(root, "<stem>") : "") << "\n";
    }
    for (const auto& sel : cases["loads"]) {
        const auto file = sel.get<std::string>();
        std::cout << "V|" << file << "|" << ValidManifestPath(file) << "\n";
    }

    const auto choices = Discover(g_app);
    for (size_t i = 0; i < choices.size(); i++)
        std::cout << "D|" << i << "|" << choices[i].file << "|" << choices[i].name << "\n";

    const fs::path legacy = fs::path(g_app) / "background.png";
    for (const auto& sel : cases["loads"]) {
        const auto file = sel.get<std::string>();
        Load(g_app, file);

        std::string colors, images;
        for (const auto& [role, c] : std::map<std::string, pu::ui::Color>(g_colors.begin(), g_colors.end()))
            colors += role + "=" + rgba(c) + ";";
        for (const auto& [key, path] : std::map<std::string, std::string>(g_images.begin(), g_images.end()))
            images += key + "=" + rel(path) + ";";
        std::cout << "L|" << file << "|" << Name() << "|" << g_noBackgroundImage << "|" << colors << "|" << images << "\n";

        for (const auto& key : cases["colorKeys"]) {
            const auto k = key.get<std::string>();
            std::cout << "C|" << file << "|" << k << "|" << HasColor(k) << "|" << rgba(Color(k, {1, 2, 3, 4})) << "\n";
        }
        for (const auto& role : cases["roles"])
            for (const auto& fb : cases["fallbacks"])
                std::cout << "K|" << file << "|" << role.get<std::string>() << "|" << fb.get<std::string>() << "|"
                          << rgba(Color(role, pu::ui::Color::FromHex(fb))) << "\n";
        for (const auto& hex : cases["palette"])
            std::cout << "T|" << file << "|" << hex.get<std::string>() << "|" << rgba(Palette(hex)) << "\n";
        for (const auto& asset : cases["assets"])
            std::cout << "A|" << file << "|" << asset.get<std::string>() << "|" << rel(Asset(asset)) << "\n";
        for (int legacyExists = 0; legacyExists < 2; legacyExists++) {
            if (legacyExists) writeFile(legacy, json{{"png", {1280, 720}}});
            else fs::remove(legacy);
            for (int oled = 0; oled < 2; oled++) {
                pu::ui::Layout layout;
                ApplyBackground(layout, oled, g_app);
                std::cout << "B|" << file << "|" << oled << "|" << legacyExists << "|" << rgba(layout.bg) << "|" << rel(layout.image) << "\n";
            }
        }
    }
    fs::remove_all(g_app);
    return 0;
}
