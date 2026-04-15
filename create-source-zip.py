import os
import stat
import sys
import zipfile
from pathlib import Path


def iter_files(source_root: Path, include_paths: list[str]):
    for relative in include_paths:
        target = source_root / relative
        if target.is_dir():
            for path in sorted(target.rglob("*")):
                if path.is_file():
                    yield path, path.relative_to(source_root).as_posix()
        elif target.is_file():
            yield target, target.relative_to(source_root).as_posix()


def main() -> int:
    if len(sys.argv) < 4:
        print("Usage: python create-source-zip.py <source_root> <zip_path> <include_path> [...]", file=sys.stderr)
        return 1

    source_root = Path(sys.argv[1]).resolve()
    zip_path = Path(sys.argv[2]).resolve()
    include_paths = sys.argv[3:]

    zip_path.parent.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for file_path, archive_name in iter_files(source_root, include_paths):
            file_mode = stat.S_IFREG | 0o644
            info = zipfile.ZipInfo.from_file(file_path, archive_name)
            info.create_system = 3
            info.external_attr = file_mode << 16

            with file_path.open("rb") as handle:
                archive.writestr(
                    info,
                    handle.read(),
                    compress_type=zipfile.ZIP_DEFLATED,
                    compresslevel=9,
                )

    print(f"Created {zip_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
