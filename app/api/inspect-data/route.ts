import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { currentUser } from '@clerk/nextjs/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all existing data
    const [
      { data: users, count: usersCount },
      { data: customers, count: customersCount },
      { data: projects, count: projectsCount },
      { data: categories, count: categoriesCount },
      { data: tasks, count: tasksCount },
      { data: comments, count: commentsCount },
      { data: taskTemplates, count: templatesCount }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact' }),
      supabase.from('customers').select('*', { count: 'exact' }),
      supabase.from('projects').select('*', { count: 'exact' }),
      supabase.from('project_categories').select('*', { count: 'exact' }),
      supabase.from('tasks').select('*', { count: 'exact' }),
      supabase.from('comments').select('*', { count: 'exact' }),
      supabase.from('task_templates').select('*', { count: 'exact' })
    ])

    return NextResponse.json({
      summary: {
        users: usersCount || 0,
        customers: customersCount || 0,
        projects: projectsCount || 0,
        categories: categoriesCount || 0,
        tasks: tasksCount || 0,
        comments: commentsCount || 0,
        taskTemplates: templatesCount || 0
      },
      data: {
        users: users || [],
        customers: customers || [],
        projects: projects || [],
        categories: categories || [],
        tasks: tasks || [],
        comments: comments || [],
        taskTemplates: taskTemplates || []
      }
    })

  } catch (error) {
    console.error('Error inspecting data:', error)
    return NextResponse.json(
      { error: 'Failed to inspect data', details: error },
      { status: 500 }
    )
  }
}
