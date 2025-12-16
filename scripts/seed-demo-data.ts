import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seedDemoData() {
  console.log('🌱 Starting demo data seeding...\n')

  try {
    // Get current user ID (we'll use this as the owner/assignee)
    const { data: users } = await supabase
      .from('users')
      .select('id, name, email')
      .limit(5)

    if (!users || users.length === 0) {
      console.log('⚠️  No users found. Please sign in first.')
      return
    }

    const currentUserId = users[0].id
    const userIds = users.map(u => u.id)
    console.log(`✓ Found ${users.length} users`)

    // Create demo customers
    console.log('\n📋 Creating demo customers...')
    const { data: customers } = await supabase
      .from('customers')
      .insert([
        {
          name: 'Acme Corporation',
          type: 'Enterprise',
          email: 'contact@acme.com',
          phone: '+1-555-0100',
          website: 'https://acme.com',
          status: 'active'
        },
        {
          name: 'TechStart Inc',
          type: 'Startup',
          email: 'hello@techstart.io',
          phone: '+1-555-0200',
          website: 'https://techstart.io',
          status: 'active'
        },
        {
          name: 'Global Retail Co',
          type: 'Retail',
          email: 'info@globalretail.com',
          phone: '+1-555-0300',
          status: 'active'
        }
      ])
      .select()

    console.log(`✓ Created ${customers?.length || 0} customers`)

    // Get categories (should already exist from migration)
    const { data: categories } = await supabase
      .from('project_categories')
      .select('id, name')

    console.log(`✓ Found ${categories?.length || 0} categories`)

    // Create demo projects
    console.log('\n📁 Creating demo projects...')
    const { data: projects } = await supabase
      .from('projects')
      .insert([
        {
          title: 'Summer Marketing Campaign 2025',
          description: 'Launch our biggest summer campaign featuring new product line with social media, email, and influencer marketing.',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          customer_id: customers?.[0]?.id,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          owner: users[0].name || users[0].email,
          assignees: userIds.slice(0, 3),
          category_ids: categories?.slice(0, 2).map(c => c.id) || [],
          assets: [
            { label: 'Brand Guidelines', url: 'https://dropbox.com/brand-guidelines' },
            { label: 'Creative Assets', url: 'https://dropbox.com/creative-assets' },
            { label: 'Campaign Brief', url: 'https://dropbox.com/campaign-brief' }
          ]
        },
        {
          title: 'Website Redesign Project',
          description: 'Complete overhaul of company website with modern design, improved UX, and mobile optimization.',
          status: 'REVIEW',
          priority: 'URGENT',
          customer_id: customers?.[1]?.id,
          due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          owner: users[0].name || users[0].email,
          assignees: userIds.slice(0, 2),
          category_ids: categories?.slice(1, 3).map(c => c.id) || [],
          assets: [
            { label: 'Wireframes', url: 'https://dropbox.com/wireframes' },
            { label: 'Design Mockups', url: 'https://dropbox.com/mockups' }
          ]
        },
        {
          title: 'Q1 Product Launch',
          description: 'Coordinate the launch of our flagship product including PR, events, and distribution.',
          status: 'START',
          priority: 'HIGH',
          customer_id: customers?.[0]?.id,
          due_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          owner: users[0].name || users[0].email,
          assignees: userIds.slice(0, 4),
          category_ids: categories?.slice(0, 1).map(c => c.id) || [],
          assets: [
            { label: 'Product Specs', url: 'https://dropbox.com/product-specs' }
          ]
        },
        {
          title: 'Employee Training Program',
          description: 'Develop and implement comprehensive training program for new team members.',
          status: 'DRAFT',
          priority: 'MEDIUM',
          customer_id: customers?.[2]?.id,
          due_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          owner: users[0].name || users[0].email,
          assignees: userIds.slice(0, 2),
          category_ids: categories?.slice(3, 4).map(c => c.id) || [],
          assets: []
        },
        {
          title: 'Annual Report 2024',
          description: 'Compile and design the annual company report with financial data and highlights.',
          status: 'COMPLETED',
          priority: 'MEDIUM',
          customer_id: customers?.[0]?.id,
          due_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          owner: users[0].name || users[0].email,
          assignees: userIds.slice(0, 2),
          category_ids: [],
          assets: [
            { label: 'Final Report PDF', url: 'https://dropbox.com/annual-report-2024.pdf' }
          ]
        },
        {
          title: 'Customer Feedback Analysis',
          description: 'Analyze Q4 customer feedback and create actionable insights report.',
          status: 'APPROVED',
          priority: 'LOW',
          customer_id: customers?.[1]?.id,
          due_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
          owner: users[0].name || users[0].email,
          assignees: userIds.slice(0, 1),
          category_ids: categories?.slice(2, 3).map(c => c.id) || [],
          assets: [
            { label: 'Survey Data', url: 'https://dropbox.com/survey-data.xlsx' }
          ]
        }
      ])
      .select()

    console.log(`✓ Created ${projects?.length || 0} projects`)

    // Create demo tasks
    console.log('\n✅ Creating demo tasks...')
    const tasks = []

    if (projects && projects.length > 0) {
      // Tasks for first project (Marketing Campaign)
      tasks.push(
        {
          project_id: projects[0].id,
          title: 'Design social media graphics',
          details: 'Create Instagram, Facebook, and Twitter post templates',
          status: 'IN_PROGRESS',
          assignee_ids: userIds.slice(0, 1),
          target_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          attachment: 'https://dropbox.com/social-templates'
        },
        {
          project_id: projects[0].id,
          title: 'Write email campaign copy',
          details: 'Draft 5 email sequences for the campaign',
          status: 'DRAFT',
          assignee_ids: userIds.slice(1, 2),
          target_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          project_id: projects[0].id,
          title: 'Schedule influencer partnerships',
          details: 'Reach out to 10 potential influencers',
          status: 'DRAFT',
          assignee_ids: userIds.slice(0, 2),
          target_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      )

      // Tasks for second project (Website Redesign)
      tasks.push(
        {
          project_id: projects[1].id,
          title: 'Finalize homepage design',
          details: 'Complete hero section and CTA buttons',
          status: 'REVIEW',
          assignee_ids: userIds.slice(0, 1),
          target_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          attachment: 'https://figma.com/homepage-design'
        },
        {
          project_id: projects[1].id,
          title: 'Mobile responsive testing',
          details: 'Test all pages on iOS and Android devices',
          status: 'IN_PROGRESS',
          assignee_ids: userIds.slice(1, 2),
          target_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          project_id: projects[1].id,
          title: 'SEO optimization',
          details: 'Implement meta tags and structured data',
          status: 'COMPLETED',
          assignee_ids: userIds.slice(0, 1),
          target_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date().toISOString()
        }
      )

      // Tasks for third project (Product Launch)
      tasks.push(
        {
          project_id: projects[2].id,
          title: 'Create press release',
          details: 'Draft official product launch announcement',
          status: 'START',
          assignee_ids: userIds.slice(0, 2),
          target_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          project_id: projects[2].id,
          title: 'Plan launch event',
          details: 'Book venue and arrange catering for 100 people',
          status: 'DRAFT',
          assignee_ids: userIds.slice(1, 3),
          target_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString()
        }
      )
    }

    const { data: createdTasks } = await supabase
      .from('tasks')
      .insert(tasks)
      .select()

    console.log(`✓ Created ${createdTasks?.length || 0} tasks`)

    // Create demo comments
    console.log('\n💬 Creating demo comments...')
    const comments = []

    if (projects && projects.length > 0) {
      comments.push(
        {
          entity_type: 'PROJECT',
          entity_id: projects[0].id,
          author: users[0].name || users[0].email,
          author_email: users[0].email,
          content: 'Great progress on this campaign! The social media strategy looks solid. Let\'s make sure we align with the brand team before finalizing.'
        },
        {
          entity_type: 'PROJECT',
          entity_id: projects[0].id,
          author: users[1]?.name || users[1]?.email || 'Team Member',
          author_email: users[1]?.email || 'team@example.com',
          content: 'I\'ve reviewed the budget and we have some flexibility for additional influencer partnerships if needed.'
        },
        {
          entity_type: 'PROJECT',
          entity_id: projects[1].id,
          author: users[0].name || users[0].email,
          author_email: users[0].email,
          content: 'The new design looks amazing! Mobile responsiveness is much better than the old site.'
        },
        {
          entity_type: 'PROJECT',
          entity_id: projects[1].id,
          author: users[1]?.name || users[1]?.email || 'Team Member',
          author_email: users[1]?.email || 'team@example.com',
          content: 'We need to discuss the color scheme with the client. Can we schedule a call this week?'
        },
        {
          entity_type: 'PROJECT',
          entity_id: projects[2].id,
          author: users[0].name || users[0].email,
          author_email: users[0].email,
          content: 'Excited to kick off this product launch! Let\'s aim to have the press release ready by next Friday.'
        }
      )

      await supabase
        .from('comments')
        .insert(comments)

      console.log(`✓ Created ${comments.length} comments`)
    }

    // Create activity logs
    console.log('\n📊 Creating activity logs...')
    const activities = []

    if (projects && projects.length > 0) {
      activities.push(
        {
          type: 'project_created',
          description: `Project "${projects[0].title}" created`,
          project_id: projects[0].id,
          performed_by: users[0].name || users[0].email
        },
        {
          type: 'project_updated',
          description: `Project "${projects[0].title}" updated status`,
          project_id: projects[0].id,
          performed_by: users[0].name || users[0].email
        },
        {
          type: 'project_created',
          description: `Project "${projects[1].title}" created`,
          project_id: projects[1].id,
          performed_by: users[0].name || users[0].email
        },
        {
          type: 'project_updated',
          description: `Project "${projects[4].title}" completed`,
          project_id: projects[4].id,
          performed_by: users[0].name || users[0].email
        }
      )

      await supabase
        .from('activities')
        .insert(activities)

      console.log(`✓ Created ${activities.length} activity logs`)
    }

    console.log('\n✨ Demo data seeding completed successfully!\n')
    console.log('Summary:')
    console.log(`  • ${customers?.length || 0} customers`)
    console.log(`  • ${projects?.length || 0} projects`)
    console.log(`  • ${createdTasks?.length || 0} tasks`)
    console.log(`  • ${comments.length} comments`)
    console.log(`  • ${activities.length} activity logs`)
    console.log('\nYou can now view the demo data in your application! 🎉\n')

  } catch (error) {
    console.error('❌ Error seeding demo data:', error)
    throw error
  }
}

// Run the seed function
seedDemoData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
