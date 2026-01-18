from fpdf import FPDF
import os

pdf = FPDF()
pdf.add_page()
pdf.set_font("Arial", size=12)
pdf.cell(200, 10, txt="The quick brown fox jumps over the lazy dog.", ln=1, align="C")

output_path = os.path.join("tests", "text", "sample.pdf")
pdf.output(output_path)
print(f"PDF created at {output_path}")
