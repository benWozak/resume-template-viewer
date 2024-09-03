import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import latex from 'node-latex';
import { Readable } from 'stream';
import { escapeLatex, formatPhoneNumber, escapeUrl, formatDate } from '@/util/functions/format';

function generateSkillsContent(skills: any[]): string {
  return skills.map((skill, index) => {
    const title = escapeLatex(skill.skill_title);
    const items = escapeLatex(skill.skill_items);
    
    // Adds less vertical space after each item, except the last one
    const verticalSpace = index < skills.length - 1 ? '\\\\[0.2em]' : '\\\\';
    
    return `${title} & ${items} ${verticalSpace}`;
  }).join('\n    ');
}

export async function POST(req: NextRequest) {
  let data;
  try {
    data = await req.json();
  } catch (error) {
    console.error('Error parsing request JSON:', error);
    return NextResponse.json({ success: false, error: 'Invalid JSON in request body' }, { status: 400 });
  }

  try {
    const templatePath = path.join(process.cwd(), 'latex', 'templates', data.templateName, `${data.templateName}.tex`);

    console.log('Checking to see if template exists...')
    try {
      await fs.access(templatePath);
    } catch (error) {
      console.error('Template file not found:', templatePath);
      return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
    }

    let template = await fs.readFile(templatePath, 'utf-8');

    console.log('Template found!')
    console.log('Now populating template data...')

    // console.log(data)

    // Replace placeholders
    template = template.replace(/FULL_NAME/g, escapeLatex(data.full_name));
    template = template.replace(/PHONE/g, escapeLatex(formatPhoneNumber(data.phone)));
    template = template.replace(/EMAIL/g, escapeLatex(data.email));
    template = template.replace(/PROFILE/g, escapeLatex(data.profile));

    template = template.replace(/LINKEDIN/g, escapeUrl(data.socials.linkedin_url));
    template = template.replace(/GITHUB/g, escapeUrl(data.socials.github_url));
    template = template.replace(/PORTFOLIO/g, escapeUrl(data.socials.portfolio_url));

    template = template.replace(/ED_INSTITUTION/g, escapeLatex(data.education.institution));
    template = template.replace(/ED_LOCATION/g, escapeLatex(data.education.location));
    template = template.replace(/ED_DATE/g, escapeLatex(`${formatDate(data.education.duration.split(' - ')[0])} - ${formatDate(data.education.duration.split(' - ')[1])}`));
    template = template.replace(/ED_DEGREE/g, escapeLatex(data.education.degree));

    data.experience.forEach((exp: any, index: number) => {
      const companyPlaceholder = `COMPANY_${index + 1}`;
      const datePlaceholder = `DATE_${index + 1}`;
      const titlePlaceholder = `TITLE_${index + 1}`;

      template = template.replace(new RegExp(companyPlaceholder, 'g'), escapeLatex(exp.company));
      template = template.replace(new RegExp(datePlaceholder, 'g'), 
        `${formatDate(exp.duration.split(' - ')[0])} - ${formatDate(exp.duration.split(' - ')[1])}`
      );
      template = template.replace(new RegExp(titlePlaceholder, 'g'), escapeLatex(exp.position));

      exp.description.forEach((bullet: string, bulletIndex: number) => {
        const bulletPlaceholder = `COMP_${index + 1}_BULLET_${bulletIndex + 1}`;
        template = template.replace(new RegExp(bulletPlaceholder, 'g'), escapeLatex(bullet));
      });
    });

    const skillsContent = generateSkillsContent(data.skills);
    template = template.replace(/SKILLS/g, skillsContent);

    console.log('Generating PDF...');
    const input = Readable.from(template);
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      const pdf = latex(input, {
        inputs: path.join(process.cwd(), 'latex', 'templates', data.templateName),
      });
      pdf.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdf.on('end', () => resolve(Buffer.concat(chunks)));
      pdf.on('error', (err) => {
        console.error('LaTeX compilation error:', err);
        reject(new Error('LaTeX compilation failed'));
      });
    });

    const pdfPath = path.join(process.cwd(), 'public', 'generated_resume.pdf');
    await fs.writeFile(pdfPath, pdfBuffer);

    console.log('PDF generated successfully');
    return NextResponse.json({ success: true, pdfPath: '/generated_resume.pdf' });
  } catch (error) {
    console.error('Error generating resume:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}