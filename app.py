from flask import Flask, render_template, request, Response, jsonify
import requests
import re
from urllib.parse import urlparse, unquote
import os

app = Flask(__name__)

# 허용된 콘텐츠 타입 (직접 링크된 미디어 파일만)
ALLOWED_CONTENT_TYPES = [
    "video/", "audio/", "image/",
    "application/octet-stream",
    "application/pdf",
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}


def is_allowed(content_type: str) -> bool:
    return any(content_type.startswith(t) for t in ALLOWED_CONTENT_TYPES)


def guess_filename(url: str, content_type: str) -> str:
    # URL에서 파일명 추출
    path = unquote(urlparse(url).path)
    name = os.path.basename(path)
    if name and "." in name:
        return name

    # 확장자 추측
    ext_map = {
        "video/mp4": ".mp4", "video/webm": ".webm", "video/ogg": ".ogv",
        "audio/mpeg": ".mp3", "audio/ogg": ".ogg", "audio/wav": ".wav",
        "image/jpeg": ".jpg", "image/png": ".png", "image/gif": ".gif",
        "image/webp": ".webp", "application/pdf": ".pdf",
    }
    ext = ext_map.get(content_type.split(";")[0].strip(), ".bin")
    return f"download{ext}"


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/info", methods=["POST"])
def info():
    """URL 정보 미리 확인"""
    url = request.json.get("url", "").strip()
    if not url.startswith("http"):
        return jsonify({"error": "올바른 URL을 입력해 주세요 (http 또는 https로 시작)"}), 400

    try:
        r = requests.head(url, headers=HEADERS, timeout=10, allow_redirects=True)
        content_type = r.headers.get("content-type", "")
        content_length = r.headers.get("content-length")

        if not is_allowed(content_type):
            return jsonify({
                "error": f"지원하지 않는 파일 형식입니다.\n감지된 타입: {content_type}\n\n직접 파일 URL(.mp4, .mp3, .pdf 등)을 입력해 주세요."
            }), 400

        size_str = ""
        if content_length:
            size_mb = int(content_length) / (1024 * 1024)
            size_str = f"{size_mb:.1f} MB" if size_mb >= 1 else f"{int(content_length)/1024:.0f} KB"

        filename = guess_filename(url, content_type)
        return jsonify({
            "filename": filename,
            "content_type": content_type.split(";")[0].strip(),
            "size": size_str or "알 수 없음",
        })

    except requests.exceptions.Timeout:
        return jsonify({"error": "요청 시간이 초과되었습니다."}), 400
    except requests.exceptions.ConnectionError:
        return jsonify({"error": "URL에 연결할 수 없습니다."}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/download")
def download():
    """스트리밍 다운로드"""
    url = request.args.get("url", "").strip()
    if not url.startswith("http"):
        return "잘못된 URL입니다.", 400

    try:
        r = requests.get(url, headers=HEADERS, stream=True, timeout=30, allow_redirects=True)
        content_type = r.headers.get("content-type", "application/octet-stream")

        if not is_allowed(content_type):
            return "지원하지 않는 파일 형식입니다.", 400

        filename = guess_filename(url, content_type)

        def generate():
            for chunk in r.iter_content(chunk_size=8192):
                if chunk:
                    yield chunk

        return Response(
            generate(),
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Type": content_type,
                "Content-Length": r.headers.get("content-length", ""),
            }
        )

    except Exception as e:
        return f"오류 발생: {e}", 500


if __name__ == "__main__":
    app.run(debug=True)
