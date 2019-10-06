interface FileType {
  File: string,
  Directory: string,
  Unknown: string
}

import path from 'path';
import fs from 'fs';

// ファイルタイプの列挙体
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
const getFileType = (path: string): string => {
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
const listFiles = (dirPath: string): string[] => {
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

/**
 * ファイルのファイル内容を文字列として取得
 * @param {string} filePath
 * @return {string}
 */
const fileContent = (filePath: string): string => {
  return fs.readFileSync(filePath, 'utf8')
};

/**
 * 文字列内に出現する名前を取得する
 * @param {string} content
 * @return {string[]}
 */
const nameList = (content: string): string[] => {
  return content.split(/[^0-9^a-z^A-Z^_]+/);
};

/**
 * 名前の出現数を取得する
 * @param {string[]} nameList
 * @return {{ [index: string]: number }}
 */
const nameCount = (nameList: string[]): { [index: string]: number } => {
  const counts: { [index: string]: number } = {};
  for(let i=0;i< nameList.length;i++)
  {
    let key: string = nameList[i];
    counts[key] = (counts[key])? counts[key] + 1 : 1 ;
  }
  return counts;
};

/**
 * レポートのHTMLファイルを出力
 */
const generateReportHTML = (counts: { [index: string]: number }): void => {
  const labels: string[] = [];
  const data: number[] = [];
  for(let key in counts){
    labels.push(key);
    data.push(counts[key]);
  }
  let labelsStr = "";
  labels.map(label => {
    labelsStr += '"' + label + '"' + ',';
  });
  // 最後の,を削除する
  labelsStr = labelsStr.slice(0,-1);

  let dataStr = "";
  data.map(d => {
    dataStr +=  d + ',';
  });
  // 最後の,を削除する
  console.log(dataStr);
  dataStr = dataStr.slice(0,-1);

  const chartScript = 'window.onload = function() {\n' +
      '    var ctx = document.getElementById(\'chart\').getContext(\'2d\');\n' +
      '    ctx.canvas.height = 2000;\n' +
      '    new Chart(ctx, {\n' +
      '        type: \'horizontalBar\',\n' +
      '        data: {\n' +
      '            labels: [' + labelsStr + '],\n' +
      '            datasets: [\n' +
      '                {\n' +
      '                    label: "Naming count",\n' +
      '                    backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9", "#c45850"],\n' +
      '                    data: [' + dataStr + ']\n' +
      '                }\n' +
      '            ]\n' +
      '        },\n' +
      '        options: {\n' +
      '            responsive: true,\n' +
      '            maintainAspectRatio: false,\n' +
      '            legend: {display: false},\n' +
      '            title: {\n' +
      '                display: true,\n' +
      '                text: \'Naming count report\'\n' +
      '            }\n' +
      '        }\n' +
      '    });\n' +
      '}';
  const htmlContent = '<!DOCTYPE html>\n' +
      '<html lang="ja">\n' +
      '<head>\n' +
      '  <title>Chart.js TEST</title>\n' +
      '  <meta charset="UTF-8">\n' +
      '</head>\n' +
      '<body>\n' +
      '  <h1>Chart.jsのテスト</h1>\n' +
      '\n' +
      '  <div style="width: 100%">\n' +
      '    <canvas id="chart"></canvas>\n' +
      '  </div>\n' +
      '\n' +
      '  <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.8.0/Chart.min.js"></script>\n' +
      '  <script>\n' +
      chartScript +
      '\n' +
      '  </script>\n' +
      '</body>\n' +
      '</html>';
  fs.writeFile('./report.html', htmlContent,  function(err) {
    if (err) {
      return console.error(err);
    }
    console.log("Report created:)!!!");
  });
};

const target : string | null = process.argv[2];
const dirPath = target ? path.resolve("", target) : path.resolve("");
const list = listFiles(dirPath);
const content = fileContent(list[0]);
const names = nameList(content);
const counts = nameCount(names);
generateReportHTML(counts);


console.log("list:: ");
console.log(list);
console.log("content:: ");
console.log(content);
console.log("name list:: ");
console.log(names);
console.log("name count:: ");
console.log(counts);
