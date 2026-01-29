import { useState, useEffect, useCallback } from 'react'
import { useSupabase } from './useSupabase'
import { useAuth } from './useAuth'
import type { Category, CategoryInsert, CategoryUpdate, CategoryType } from '@/types/database.types'

export function useCategories(filterType?: CategoryType) {
  const { user } = useAuth()
  const supabase = useSupabase()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      let query = supabase
        .from('categories')
        .select('*')
        .order('is_default', { ascending: false })
        .order('name', { ascending: true })

      // RLS handles filtering: default categories OR user's own
      if (filterType) {
        query = query.eq('type', filterType)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      setCategories(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setIsLoading(false)
    }
  }, [filterType, supabase])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const createCategory = async (data: Omit<CategoryInsert, 'user_id' | 'is_default'>) => {
    if (!user) throw new Error('ไม่พบผู้ใช้')

    const { data: newCategory, error } = await supabase
      .from('categories')
      .insert({
        ...data,
        user_id: user.id,
        is_default: false,
        icon: data.icon ?? null,
        color: data.color ?? null,
        parent_id: data.parent_id ?? null,
      })
      .select()
      .single()

    if (error) throw error

    setCategories((prev) => [...prev, newCategory])
    return newCategory
  }

  const updateCategory = async (id: string, data: CategoryUpdate) => {
    const { data: updated, error } = await supabase
      .from('categories')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? updated : cat))
    )
    return updated
  }

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id)

    if (error) throw error

    setCategories((prev) => prev.filter((cat) => cat.id !== id))
  }

  const incomeCategories = categories.filter((c) => c.type === 'income')
  const expenseCategories = categories.filter((c) => c.type === 'expense')
  const defaultCategories = categories.filter((c) => c.is_default)
  const customCategories = categories.filter((c) => !c.is_default)

  return {
    categories,
    incomeCategories,
    expenseCategories,
    defaultCategories,
    customCategories,
    isLoading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}
