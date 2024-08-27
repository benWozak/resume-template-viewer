import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateResume } from './actions'

// Mock the fetch function
global.fetch = vi.fn()

// Mock the revalidatePath function
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('generateResume', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should successfully generate a resume', async () => {
    // Mock successful responses
    const mockStrapiResponse = {
      json: () => Promise.resolve({ data: { attributes: { full_name: 'John Doe' } } }),
      ok: true,
    }
    const mockPDFResponse = {
      json: () => Promise.resolve({ success: true, pdfPath: '/generated_resume.pdf' }),
      ok: true,
    }

    // @ts-ignore
    global.fetch.mockResolvedValueOnce(mockStrapiResponse).mockResolvedValueOnce(mockPDFResponse)

    const result = await generateResume()

    expect(result.success).toBe(true)
    expect(result.pdfPath).toBe('/generated_resume.pdf')
    expect(global.fetch).toHaveBeenCalledTimes(2)
    expect(global.fetch).toHaveBeenCalledWith(`${process.env.NEXT_PUBLIC_API_URL}`, expect.any(Object))
    expect(global.fetch).toHaveBeenCalledWith(`${process.env.NEXT_PUBLIC_BASE_URL}/api/resume`, expect.any(Object))
  })

  it('should handle Strapi API errors', async () => {
    // Mock failed Strapi response
    const mockErrorResponse = {
      ok: false,
      status: 404,
    }

    // @ts-ignore
    global.fetch.mockResolvedValueOnce(mockErrorResponse)

    const result = await generateResume()

    expect(result.success).toBe(false)
    expect(result.error).toBe('HTTP error! status: 404')
    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(global.fetch).toHaveBeenCalledWith(`${process.env.NEXT_PUBLIC_API_URL}`, expect.any(Object))
  })

  it('should handle PDF generation errors', async () => {
    // Mock successful Strapi response but failed PDF generation
    const mockStrapiResponse = {
      json: () => Promise.resolve({ data: { attributes: { full_name: 'John Doe' } } }),
      ok: true,
    }
    const mockPDFErrorResponse = {
      ok: false,
      status: 500,
    }

    // @ts-ignore
    global.fetch.mockResolvedValueOnce(mockStrapiResponse).mockResolvedValueOnce(mockPDFErrorResponse)

    const result = await generateResume()

    expect(result.success).toBe(false)
    expect(result.error).toBe('Failed to generate resume. Status: 500')
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })
})