import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/update-template/route'
import * as db from '@/db'
import { resumeTemplates } from '@/db/schema'

// Mock the database
vi.mock('@/db', () => ({
  db: {
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn()
        }))
      }))
    }))
  }
}))

describe('/api/update-template', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should update the template successfully', async () => {
    const mockRequestBody = {
      id: 1,
      name: 'Updated Template Name',
      description: 'Updated template description',
    }

    const req = new NextRequest('http://localhost:3000/api/update-template', {
      method: 'POST',
      body: JSON.stringify(mockRequestBody),
    })

    // Mock the database update operation
    const mockReturning = vi.fn().mockResolvedValue([{
      id: 1,
      name: 'Updated Template Name',
      description: 'Updated template description',
      slug: 'updated-template-name',
      createdAt: new Date(),
      updatedAt: new Date(),
    }])

    const mockWhere = vi.fn(() => ({ returning: mockReturning }))
    const mockSet = vi.fn(() => ({ where: mockWhere }))
    vi.mocked(db.db.update).mockReturnValue({ set: mockSet } as any)

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      success: true,
      updatedTemplate: expect.objectContaining({
        id: 1,
        name: 'Updated Template Name',
        description: 'Updated template description',
      }),
    })

    // Verify that the database update function was called with correct parameters
    expect(db.db.update).toHaveBeenCalledWith(resumeTemplates)
    expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Updated Template Name',
      description: 'Updated template description',
    }))
    expect(mockWhere).toHaveBeenCalled()
    expect(mockReturning).toHaveBeenCalled()
  })

  it('should handle invalid input', async () => {
    const req = new NextRequest('http://localhost:3000/api/update-template', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({
      success: false,
      error: 'Invalid input',
    })
  })

  it('should handle template not found', async () => {
    const mockRequestBody = {
      id: 999,  // Non existent id value
      name: 'Test Name',
    }

    const req = new NextRequest('http://localhost:3000/api/update-template', {
      method: 'POST',
      body: JSON.stringify(mockRequestBody),
    })

    // Mock the database update operation to return an empty array (no updates)
    const mockReturning = vi.fn().mockResolvedValue([])
    const mockWhere = vi.fn(() => ({ returning: mockReturning }))
    const mockSet = vi.fn(() => ({ where: mockWhere }))
    vi.mocked(db.db.update).mockReturnValue({ set: mockSet } as any)

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data).toEqual({
      success: false,
      error: 'Template not found',
    })
  })

  it('should handle database errors', async () => {
    const mockRequestBody = {
      id: 1,
      name: 'New Name',
    }

    const req = new NextRequest('http://localhost:3000/api/update-template', {
      method: 'POST',
      body: JSON.stringify(mockRequestBody),
    })

    // Mock the database update operation to throw an error
    const mockReturning = vi.fn().mockRejectedValue(new Error('Database error'))
    const mockWhere = vi.fn(() => ({ returning: mockReturning }))
    const mockSet = vi.fn(() => ({ where: mockWhere }))
    vi.mocked(db.db.update).mockReturnValue({ set: mockSet } as any)

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({
      success: false,
      error: 'Internal server error',
    })
  })
})