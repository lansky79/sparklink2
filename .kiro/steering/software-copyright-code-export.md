---
inclusion: manual
---

# 软著源代码导出指南

## 任务说明

使用 python-docx 生成软著申请用的源代码文档（.docx），格式要求：前30页 + 后30页，每页≥50行（建议52行），共60页。

## 生成规则

### 页面格式
- 首页第一行：软件全称（如"设备资产定位管理系统V1.0"），居中加粗
- 正文字体：宋体 / 小四 / 行距固定20磅
- 页边距：上下左右各2cm
- 每页行数：52行（可微调，但不低于50行）
- 文件分隔：每个源文件开头加一行 `// 文件: 文件名` 作为标记

### 代码选取原则
1. 优先放核心业务逻辑代码（路由、API、数据库操作），而非HTML模板或CSS
2. 建议文件顺序（按重要性）：
   - app.py（Flask主应用，路由+API）
   - database.py（数据库schema）
   - main.js（前端核心交互）
   - indoor-map.js（地图渲染）
   - seed.py（数据初始化）
   - 各HTML模板（按功能重要性排）
   - style.css（放最后，凑页数用）
3. 不要放 node_modules、__pycache__、.db 等非源码文件

### 前30页 / 后30页截断逻辑
- **前30页**：从第一个文件开头连续输出，到第30页末尾截断（可以截在函数中间，不需要完整）
- **后30页**：从所有代码的末尾往前倒推30页，确保最后一页是完整的代码片段结尾。如果行数不够整页，可以删减注释来凑齐
- 中间部分直接跳过，不需要连续

### 去AI痕迹检查
生成前检查源代码：
- 不要有"每个函数前都有一行功能注释"的统一模式（有一些是正常的，但不要每个都有）
- 不要有写死的演示数字（如 utilization_rate = 85）
- 不要有 `# TODO` `# FIXME` 等刻意添加的标记
- 变量命名可以有个人风格（如 `cnt` `res` `idx`）但不要刻意

### python-docx 生成要点

```python
from docx import Document
from docx.shared import Pt, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn

doc = Document()

# 页边距
for section in doc.sections:
    section.top_margin = Cm(2)
    section.bottom_margin = Cm(2)
    section.left_margin = Cm(2)
    section.right_margin = Cm(2)

# 标题
title = doc.add_paragraph()
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = title.add_run('软件名称V1.0')
run.bold = True
run.font.size = Pt(12)
run.font.name = '宋体'
run._element.rPr.rFonts.set(qn('w:eastAsia'), '宋体')

# 代码行 - 逐行添加
def add_code_line(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = Pt(20)
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    run = p.add_run(text)
    run.font.size = Pt(12)  # 小四
    run.font.name = '宋体'
    run._element.rPr.rFonts.set(qn('w:eastAsia'), '宋体')
```

### 使用方式
用户说"生成软著代码文档"时，读取项目源代码文件，按上述规则拼接并生成 .docx 文件到项目根目录。
