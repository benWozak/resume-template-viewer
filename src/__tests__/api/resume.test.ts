import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/resume/route'
import fs from 'fs/promises'
import path from 'path'
import { Readable } from 'stream'

// Mocking external dependencies
vi.mock('fs/promises')
vi.mock('path')
vi.mock('node-latex', () => ({
  default: vi.fn().mockImplementation(() => {
    const readable = new Readable()
    readable.push(Buffer.from('Mock PDF content'))
    readable.push(null)
    return readable
  })
}))

describe('/api/resume', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should generate a PDF resume successfully', async () => {
    const mockRequestBody = {
      full_name: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      summary: 'Experienced software developer',
      socials: {
        linkedin_url: 'https://linkedin.com/in/johndoe',
        github_url: 'https://github.com/johndoe',
        portfolio_url: 'https://johndoe.com'
      },
      experience: [
        {
          company: 'Tech Co',
          position: 'Senior Developer',
          duration: { startDate: '2020-01-01', endDate: '2023-01-01' },
          description: ['Led team of developers', 'Implemented new features']
        }
      ],
      skills: [
        { skill_title: 'Programming', skill_items: 'JavaScript, Python, Java' }
      ],
      education: {
        institution: 'University of Technology',
        location: 'Tech City',
        duration: { startDate: '2016-09-01', endDate: '2020-05-01' },
        degree: 'Bachelor of Science in Computer Science'
      },
      templateName: 'resume_v1'
    }

    const req = new NextRequest('http://localhost:3000/api/resume', {
      method: 'POST',
      body: JSON.stringify(mockRequestBody)
    })

    // Mock file system operations
    vi.mocked(fs.access).mockResolvedValue(undefined)
    vi.mocked(fs.readFile).mockResolvedValue('Mock template content')
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    // Mock path operations
    vi.mocked(path.join).mockReturnValue('/mocked/path')

    // Mock LaTeX compilation
    const mockLatex = vi.fn().mockImplementation(() => {
      const readable = new Readable()
      process.nextTick(() => {
        readable.push(Buffer.from('Mock PDF content'))
        readable.push(null)
      })
      return readable
    })
    const latex = await import('node-latex')
    vi.mocked(latex.default).mockImplementation(mockLatex)

    const response = await POST(req)
    const data = await response.json()

    console.log('Response status:', response.status)
    console.log('Response data:', data)

    expect(response.status).toBe(200)
    expect(data).toEqual({
      success: true,
      pdfPath: '/generated_resume.pdf'
    })

    // Verify that the necessary functions were called
    expect(fs.access).toHaveBeenCalled()
    expect(fs.readFile).toHaveBeenCalled()
    expect(fs.writeFile).toHaveBeenCalled()
    expect(mockLatex).toHaveBeenCalled()
  })

  it('should handle template not found error', async () => {
    const req = new NextRequest('http://localhost:3000/api/resume', {
      method: 'POST',
      body: JSON.stringify({ templateName: 'non_existent_template' })
    })

    vi.mocked(fs.access).mockRejectedValue(new Error('File not found'))

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data).toEqual({
      success: false,
      error: 'Template not found'
    })
  })

  it('should handle invalid JSON in request body', async () => {
    const req = new NextRequest('http://localhost:3000/api/resume', {
      method: 'POST',
      body: 'invalid json'
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({
      success: false,
      error: 'Invalid JSON in request body'
    })
  })
})