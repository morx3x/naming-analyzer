interface FileType {
  File: string,
  Directory: string,
  Unknown: string
}

import path from 'path';
import fs from 'fs';

// ファイルタイプの列挙体（のつもり）
const fileType : FileType = {
  File: 'file',
  Directory: 'directory',
  Unknown: 'unknown'
};

/**
 * ファイルの種類を取得する
 * @param {string} path パス
 * @return {FileType} ファイルの種類
 */
const getFileType = (path: string) => {
  try {
    const stat = fs.statSync(path);

    switch (true) {
      case stat.isFile():
        return fileType.File;

      case stat.isDirectory():
        return fileType.Directory;

      default:
        return fileType.Unknown;
    }

  } catch(e) {
    return fileType.Unknown;
  }
};

/**
 * 指定したディレクトリ配下のすべてのファイルをリストアップする
 * @param {string} dirPath 検索するディレクトリのパス
 * @return {Array<string>} ファイルのパスのリスト
 */
const listFiles = (dirPath: string) => {
  const ret: string[] = [];
  const paths = fs.readdirSync(dirPath);

  paths.forEach(a => {
    const path = `${dirPath}/${a}`;

    switch (getFileType(path)) {
      case fileType.File:
        ret.push(path);
        break;

      case fileType.Directory:
        ret.push(...listFiles(path));
        break;

      default:
        /* noop */
    }
  });
  return ret;
};

const target : string | null = process.argv[2];
const dirPath = target ? path.resolve("", target) : path.resolve("");
const list = listFiles(dirPath);
console.log(list);
