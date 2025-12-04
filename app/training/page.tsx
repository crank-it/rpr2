'use client'

import { useState } from 'react'
import {
  GraduationCap,
  ExternalLink,
  Clock,
  Award,
  CheckCircle2,
  Monitor,
  Palette,
  Share2,
  Megaphone,
  Globe,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Calendar
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface TrainingModule {
  name: string
  url: string
  time: string
  certification?: string
  highlight?: boolean
}

interface TrainingCategory {
  id: string
  title: string
  icon: React.ReactNode
  portal: string
  portalUrl: string
  modules: TrainingModule[]
  certInfo?: string
}

const TRAINING_CATEGORIES: TrainingCategory[] = [
  {
    id: 'microsoft',
    title: 'Microsoft 365',
    icon: <Monitor className="h-5 w-5" />,
    portal: 'Microsoft Learn',
    portalUrl: 'https://learn.microsoft.com/en-us/training/m365/',
    modules: [
      { name: 'Microsoft 365 Fundamentals Path', url: 'https://learn.microsoft.com/en-us/training/paths/describe-microsoft-365-core-services-concepts/', time: '2-3 hrs', certification: 'MS-900 ($99)', highlight: true },
      { name: 'Discover New Outlook for Windows', url: 'https://learn.microsoft.com/en-us/training/paths/discover-new-outlook-windows/', time: '2-3 hrs', certification: 'Included in MS-900' },
      { name: 'Compose and Send Mail in Outlook', url: 'https://learn.microsoft.com/en-us/training/modules/compose-send-mail-new-outlook-windows/', time: '30 min' },
      { name: 'Organize Your Inbox in Outlook', url: 'https://learn.microsoft.com/en-us/training/modules/organize-your-inbox-new-outlook-windows/', time: '30 min' },
      { name: 'Microsoft 365 Basics Videos', url: 'https://support.microsoft.com/en-us/training', time: 'Variable' },
      { name: 'Outlook Training Hub', url: 'https://support.microsoft.com/en-us/office/outlook-training-8a5b816d-9052-4190-a5eb-494512343cca', time: 'Variable' }
    ],
    certInfo: 'Microsoft 365 Certified: Fundamentals (MS-900) — training free, exam $99. Retiring March 31, 2026.'
  },
  {
    id: '1password',
    title: '1Password',
    icon: <Monitor className="h-5 w-5" />,
    portal: 'Support/Resources',
    portalUrl: 'https://support.1password.com/explore/get-started/',
    modules: [
      { name: 'Get Started with 1Password', url: 'https://support.1password.com/explore/get-started/', time: '15-20 min', highlight: true },
      { name: 'Getting Started Category Hub', url: 'https://support.1password.com/category/getting-started/', time: '~1 hr' },
      { name: 'Browser Extension Guide', url: 'https://support.1password.com/getting-started-browser/', time: '20-25 min' },
      { name: 'Interactive Product Demos', url: 'https://1password.com/demos', time: '5-10 min each' },
      { name: 'Team Member Onboarding', url: 'https://support.1password.com/explore/team-member/', time: '15-20 min' },
      { name: 'Business Onboarding Kit', url: 'https://1password.com/resources/getting-started-1password-business/', time: 'Variable' }
    ],
    certInfo: 'None available for basic users.'
  },
  {
    id: 'slack',
    title: 'Slack',
    icon: <Monitor className="h-5 w-5" />,
    portal: 'Help Center/Tutorials',
    portalUrl: 'https://slack.com/help/categories/360000049063',
    modules: [
      { name: 'Quick Start Guide', url: 'https://slack.com/help/articles/360059928654-How-to-use-Slack--your-quick-start-guide', time: '10-15 min', highlight: true },
      { name: 'Workshop 101: Learn the Basics', url: 'https://slack.com/events/workshop-101', time: '60 min', highlight: true },
      { name: 'Slack Video Tutorials', url: 'https://slack.com/help/articles/360059976673-Slack-video-tutorials', time: '2-5 min each' },
      { name: 'Find and Start Conversations', url: 'https://slack.com/help/articles/1500000019301-Find-and-start-conversations', time: '5-10 min' },
      { name: 'Send and Read Messages', url: 'https://slack.com/help/articles/201457107-Send-and-read-messages', time: '10 min' },
      { name: 'Collaborate Effectively in Channels', url: 'https://slack.com/help/articles/360058495654-Collaborate-effectively-in-channels', time: '10 min' }
    ],
    certInfo: 'Slack Certified Admin ($300, not beginner-level).'
  },
  {
    id: 'canva',
    title: 'Canva',
    icon: <Palette className="h-5 w-5" />,
    portal: 'Design School',
    portalUrl: 'https://www.canva.com/design-school/courses/',
    modules: [
      { name: 'Canva Essentials', url: 'https://www.canva.com/design-school/courses/canva-essentials', time: '60 min', certification: 'Free certificate', highlight: true },
      { name: 'Canva for Work (Pro features)', url: 'https://www.canva.com/design-school/courses/canva-for-work', time: '60 min', certification: 'Free certificate' },
      { name: 'Social Media Mastery', url: 'https://www.canva.com/design-school/courses/social-media-mastery', time: '23 min', certification: 'Free certificate' },
      { name: 'Marketing with Canva', url: 'https://www.canva.com/design-school/courses/marketing-with-canva', time: '60 min', certification: 'Free certificate' },
      { name: 'Carousel Templates', url: 'https://www.canva.com/templates/s/carousel/', time: 'Self-paced' },
      { name: 'Craft Click-Worthy Carousels', url: 'https://www.canva.com/design-school/resources/craft-click-worthy-carousels', time: '15 min' }
    ],
    certInfo: 'Free certificates for all courses (25-question tests, unlimited retakes, sharable on LinkedIn).'
  },
  {
    id: 'adobe',
    title: 'Adobe Creative Cloud',
    icon: <Palette className="h-5 w-5" />,
    portal: 'Tutorials',
    portalUrl: 'https://helpx.adobe.com/creative-cloud/view-all-tutorials.html',
    modules: [
      { name: 'Creative Cloud for Beginners', url: 'https://www.adobe.com/creativecloud/starters.html', time: 'Self-paced', highlight: true },
      { name: 'Creative Cloud Student Tutorials', url: 'https://helpx.adobe.com/creative-cloud/student-tutorials.html', time: 'Self-paced' },
      { name: 'Get Started with Creative Cloud', url: 'https://helpx.adobe.com/creative-cloud/get-started.html', time: 'Self-paced' },
      { name: 'Photoshop: How to Use (Beginners)', url: 'https://www.adobe.com/products/photoshop/how-to-use.html', time: 'Self-paced', highlight: true },
      { name: 'Photoshop Basics Fundamentals', url: 'https://helpx.adobe.com/photoshop/how-to/ps-basics-fundamentals.html', time: '~30 min' },
      { name: 'Illustrator User Guide', url: 'https://helpx.adobe.com/illustrator/user-guide.html', time: 'Self-paced' },
      { name: 'All Illustrator Tutorials', url: 'https://helpx.adobe.com/illustrator/view-all-tutorials.html', time: 'Self-paced' },
      { name: 'Adobe Learning Portal', url: 'https://helpx.adobe.com/learning.html', time: 'Variable' }
    ],
    certInfo: 'No free certifications (separate paid Adobe certification programs exist).'
  },
  {
    id: 'meta-business',
    title: 'Meta Business Suite',
    icon: <Share2 className="h-5 w-5" />,
    portal: 'Blueprint/Help Center',
    portalUrl: 'https://www.facebookblueprint.com/',
    modules: [
      { name: 'Get Started with Advertising', url: 'https://www.facebookblueprint.com/student/catalog/list?category_ids=7504-get-started-with-advertising', time: 'Variable', highlight: true },
      { name: 'Create Engaging Reels (Live Training)', url: 'https://www.facebookblueprint.com/student/page/585159-create-engaging-reels-to-help-grow-your-business', time: '60 min' },
      { name: 'Blueprint Live Workshops', url: 'https://trainingworkshops.facebookblueprint.com/', time: '60 min each' },
      { name: 'In-Platform Tutorials', url: 'https://business.facebook.com', time: 'Contextual' }
    ],
    certInfo: 'Meta Business Suite is primarily learned through in-app guidance and the Business Help Center.'
  },
  {
    id: 'metricool',
    title: 'Metricool',
    icon: <Share2 className="h-5 w-5" />,
    portal: 'Academy/Help Center',
    portalUrl: 'https://metricool.com/social-media-school/',
    modules: [
      { name: 'Social Media School', url: 'https://metricool.com/social-media-school/', time: '4 modules', highlight: true },
      { name: 'Metricool Mega Tutorial', url: 'https://metricool.com/metricool-mega-tutorial/', time: '~30 min' },
      { name: 'Metricool Tutorials Hub', url: 'https://metricool.com/metricool-tutorials/', time: 'Variable' },
      { name: 'Getting Started Guide', url: 'https://help.metricool.com/en/article/getting-started-with-metricool-start-guide-faqs-1al21xc/', time: '15 min' },
      { name: 'Content Planning Guide', url: 'https://help.metricool.com/en/article/content-planning-full-guide-faqs-cs7alr/', time: 'Self-paced' },
      { name: 'Schedule from Calendar', url: 'https://help.metricool.com/en/article/how-to-schedule-content-from-the-calendar-puu2z4/', time: '10 min' },
      { name: 'Analyze and Report Hub', url: 'https://help.metricool.com/en/category/analyze-and-report-5lsv4b/', time: 'Self-paced' },
      { name: 'Generate Reports Guide', url: 'https://help.metricool.com/en/article/generate-reports-17aytqg/', time: '10 min' },
      { name: 'Masterclasses (Webinar Recordings)', url: 'https://metricool.com/masterclass/', time: '60 min each' }
    ],
    certInfo: 'Metricool Expert Certification (training free, exam €49).'
  },
  {
    id: 'google-ads',
    title: 'Google Ads',
    icon: <Megaphone className="h-5 w-5" />,
    portal: 'Skillshop',
    portalUrl: 'https://skillshop.withgoogle.com/googleads/',
    modules: [
      { name: 'AI-Powered Search Ads', url: 'https://skillshop.docebosaas.com/learn/courses/10578/foundations-of-ai-powered-search-ads-for-strategists', time: '~3.7 hrs', certification: 'Free', highlight: true },
      { name: 'Google Ads Search Certification', url: 'https://skillshop.docebosaas.com/learn/courses/8692/google-ads-search-certification', time: '~4 hrs', certification: 'Free' },
      { name: 'Display Campaign Fundamentals', url: 'https://skillshop.docebosaas.com/learn/courses/12435/learn-the-fundamentals-of-a-google-ads-display-campaign', time: '~2.6 hrs', certification: 'Free' },
      { name: 'Google Ads Display Certification', url: 'https://skillshop.docebosaas.com/learn/courses/8696/google-ads-display-certification', time: '~3 hrs', certification: 'Free' },
      { name: 'Video Campaign Fundamentals', url: 'https://skillshop.docebosaas.com/learn/courses/8838/learn-the-fundamentals-of-google-ads-video-campaigns', time: '~4 hrs', certification: 'Free' },
      { name: 'Ads Measurement Fundamentals', url: 'https://skillshop.docebosaas.com/learn/courses/12428/learn-the-fundamentals-of-google-ads-campaign-measurement', time: '~3-4 hrs', certification: 'Free' },
      { name: 'AI-Powered Shopping Ads', url: 'https://skillshop.docebosaas.com/learn/courses/13528/discover-how-ai-powered-shopping-ads-work', time: '~4 hrs', certification: 'Free' }
    ],
    certInfo: 'All Google Ads certifications are free — 75-minute exams, 80% pass rate, valid 1 year.'
  },
  {
    id: 'meta-ads',
    title: 'Meta Ads Manager',
    icon: <Megaphone className="h-5 w-5" />,
    portal: 'Blueprint',
    portalUrl: 'https://www.facebookblueprint.com/student/collection/507792-meta-ads-manager-learning',
    modules: [
      { name: 'Ads Manager Learning Path', url: 'https://www.facebookblueprint.com/student/collection/507792-meta-ads-manager-learning', time: '~2 hrs', certification: 'Free badge', highlight: true },
      { name: 'Intro to Ads Manager', url: 'https://www.facebookblueprint.com/student/collection/507792-meta-ads-manager-learning', time: '15-20 min' },
      { name: 'Choose Your Audience', url: 'https://www.facebookblueprint.com/student/collection/507792-meta-ads-manager-learning', time: '15-20 min' },
      { name: 'Choose Budget and Placements', url: 'https://www.facebookblueprint.com/student/collection/507792-meta-ads-manager-learning', time: '15-20 min' },
      { name: 'Create Your Ads', url: 'https://www.facebookblueprint.com/student/collection/507792-meta-ads-manager-learning', time: '15-20 min' },
      { name: 'Measure Results', url: 'https://www.facebookblueprint.com/student/collection/507792-meta-ads-manager-learning', time: '15-20 min' },
      { name: 'Meta Advertising Standards', url: 'https://www.facebookblueprint.com/student/collection/507792-meta-ads-manager-learning', time: '15-20 min' },
      { name: 'Manage Ads with Automated Tools', url: 'https://www.facebookblueprint.com/student/catalog/list?category_ids=7505-manage-ads-with-automated-tools', time: 'Variable' },
      { name: 'Increase Sales', url: 'https://www.facebookblueprint.com/student/catalog/list?category_ids=7507-increase-sales', time: 'Variable' },
      { name: 'Advertising with Meta (Coursera)', url: 'https://www.coursera.org/learn/advertising-with-facebook', time: '~20 hrs', certification: 'Audit free' }
    ],
    certInfo: 'Meta Certified Digital Marketing Associate ($99 exam). All training courses are free.'
  },
  {
    id: 'wordpress',
    title: 'WordPress',
    icon: <Globe className="h-5 w-5" />,
    portal: 'Learn WordPress',
    portalUrl: 'https://learn.wordpress.org/',
    modules: [
      { name: 'Beginner WordPress User Course', url: 'https://learn.wordpress.org/course/beginner-wordpress-user/', time: '~4 hrs', highlight: true },
      { name: 'Dashboard Overview Tutorial', url: 'https://learn.wordpress.org/tutorial/wordpress-dashboard-overview/', time: '15-20 min' },
      { name: 'Getting Started with Dashboard', url: 'https://learn.wordpress.org/lesson/getting-started-with-the-wordpress-dashboard/', time: '15 min' },
      { name: 'Basic WordPress Settings', url: 'https://learn.wordpress.org/lesson/basic-wordpress-settings/', time: '10 min' },
      { name: 'Creating Posts and Pages', url: 'https://learn.wordpress.org/lesson/creating-posts-and-pages-with-the-wordpress-block-editor/', time: '20 min' },
      { name: 'Posts vs Pages Difference', url: 'https://learn.wordpress.org/lesson/understanding-the-difference-between-wordpress-posts-and-pages/', time: '15 min' },
      { name: 'How to Improve SEO Rankings', url: 'https://learn.wordpress.org/lesson/how-to-improve-your-seo-rankings/', time: '15-20 min', highlight: true },
      { name: 'Categories vs Tags', url: 'https://learn.wordpress.org/tutorial/categories-vs-tags-whats-the-difference/', time: '10 min' },
      { name: 'Scheduling Posts and Pages', url: 'https://learn.wordpress.org/tutorial/scheduling-posts-and-pages/', time: '10 min' },
      { name: 'WordPress.com Courses', url: 'https://wordpress.com/support/courses/', time: '~1 hr each' }
    ],
    certInfo: 'None available (community-driven open-source education).'
  },
  {
    id: 'woocommerce',
    title: 'WooCommerce',
    icon: <Globe className="h-5 w-5" />,
    portal: 'Documentation/Learn',
    portalUrl: 'https://woocommerce.com/documentation/woocommerce/',
    modules: [
      { name: 'Getting Started Hub', url: 'https://woocommerce.com/documentation/woocommerce/getting-started/', time: 'Self-paced', highlight: true },
      { name: 'How to Build an Online Store', url: 'https://woocommerce.com/document/how-to-build-an-online-store/', time: 'Self-paced' },
      { name: 'Managing Orders (Main Guide)', url: 'https://woocommerce.com/document/managing-orders/', time: 'Self-paced', highlight: true },
      { name: 'Orders Overview & Bulk Management', url: 'https://woocommerce.com/document/managing-orders/overview-and-bulk-management/', time: '15 min' },
      { name: 'Single Order Page (View/Edit)', url: 'https://woocommerce.com/document/managing-orders/view-edit-or-add-an-order/', time: '15 min' },
      { name: 'Order Statuses', url: 'https://woocommerce.com/document/managing-orders/order-statuses/', time: '10 min' },
      { name: 'Managing Products (Main Guide)', url: 'https://woocommerce.com/document/managing-products/', time: 'Self-paced', highlight: true },
      { name: 'How to Add a Product', url: 'https://woocommerce.com/document/managing-products/add-product/', time: '20 min' },
      { name: 'Products Settings (Inventory)', url: 'https://woocommerce.com/document/configuring-woocommerce-settings/products/', time: '15 min' },
      { name: 'Variable Products', url: 'https://woocommerce.com/document/variable-product/', time: '20 min' },
      { name: 'Learn WooCommerce (Webinars)', url: 'https://woocommerce.com/learn/', time: 'Variable' }
    ],
    certInfo: 'None available.'
  },
  {
    id: 'google-analytics',
    title: 'Google Analytics 4',
    icon: <BarChart3 className="h-5 w-5" />,
    portal: 'Skillshop',
    portalUrl: 'https://skillshop.exceedlms.com/student/catalog/list?category_ids=6431-google-analytics-4',
    modules: [
      { name: 'Google Analytics Certification', url: 'https://skillshop.exceedlms.com/student/path/508845-google-analytics-certification', time: '~4-5 hrs', certification: 'Free', highlight: true },
      { name: 'Get Started Using GA4', url: 'https://skillshop.docebosaas.com/learn/courses/8108/get-started-using-google-analytics', time: '~1.5 hrs', certification: 'Included' },
      { name: 'Use GA4 for Business Objectives', url: 'https://skillshop.exceedlms.com/student/path/508845-google-analytics-certification', time: '~1.7 hrs', certification: 'Included' },
      { name: 'GA4 Help Videos', url: 'https://support.google.com/analytics/answer/13284728', time: 'Variable' }
    ],
    certInfo: 'Google Analytics Certification — completely free, timed exam, 80% pass rate, valid 12 months.'
  }
]

const CERTIFICATION_SUMMARY = [
  { platform: 'Microsoft 365', certification: 'MS-900 Fundamentals', cost: '$99 exam', validity: 'Retiring Mar 2026' },
  { platform: 'Canva', certification: 'Design School Certificates', cost: 'Free', validity: 'No expiration' },
  { platform: 'Google Ads', certification: 'Search, Display, Video, Measurement', cost: 'Free', validity: '1 year' },
  { platform: 'Google Analytics 4', certification: 'GA4 Certification', cost: 'Free', validity: '1 year' },
  { platform: 'Meta Ads', certification: 'Digital Marketing Associate', cost: '$99 exam', validity: '2 years' },
  { platform: 'Metricool', certification: 'Expert Certification', cost: '€49 exam', validity: '—' },
  { platform: '1Password, Slack, Adobe, WordPress, WooCommerce', certification: 'None', cost: '—', validity: '—' }
]

const LEARNING_PATHS = [
  {
    week: 1,
    title: 'Productivity Setup',
    items: [
      '1Password Get Started Guide (20 min)',
      'Slack Workshop 101 (60 min)',
      'Microsoft 365 Outlook Path (2-3 hrs)'
    ]
  },
  {
    week: 2,
    title: 'Design',
    items: [
      'Canva Essentials + Social Media Mastery (90 min)',
      'Adobe Creative Cloud for Beginners (self-paced)'
    ]
  },
  {
    week: 3,
    title: 'Social Media',
    items: [
      'Meta Ads Manager Learning Path (2 hrs)',
      'Metricool Social Media School (Module 1-2)'
    ]
  },
  {
    week: 4,
    title: 'Website & Analytics',
    items: [
      'WordPress Beginner Course (4 hrs)',
      'WooCommerce Managing Orders + Products (1 hr)',
      'Google Analytics 4 Certification (4-5 hrs)'
    ]
  },
  {
    week: 5,
    title: 'Advertising (Advanced)',
    items: [
      'Google Ads Search Certification (4 hrs)',
      'Meta Blueprint: Advanced Ads modules'
    ]
  }
]

const CATEGORY_GROUPS = [
  { name: 'Productivity & Setup', icon: <Monitor className="h-5 w-5" />, ids: ['microsoft', '1password', 'slack'] },
  { name: 'Design Tools', icon: <Palette className="h-5 w-5" />, ids: ['canva', 'adobe'] },
  { name: 'Social Media Management', icon: <Share2 className="h-5 w-5" />, ids: ['meta-business', 'metricool'] },
  { name: 'Advertising', icon: <Megaphone className="h-5 w-5" />, ids: ['google-ads', 'meta-ads'] },
  { name: 'Website & E-commerce', icon: <Globe className="h-5 w-5" />, ids: ['wordpress', 'woocommerce'] },
  { name: 'Analytics', icon: <BarChart3 className="h-5 w-5" />, ids: ['google-analytics'] }
]

export default function TrainingPage() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['microsoft', 'canva'])
  const [activeTab, setActiveTab] = useState<'resources' | 'paths' | 'certifications'>('resources')

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">VA Training Resources</h1>
        <p className="text-muted-foreground mt-2">
          Official, free training materials for virtual assistant onboarding at RPR Haircare
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <GraduationCap className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">12</p>
                <p className="text-sm text-muted-foreground">Platforms</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Award className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">6</p>
                <p className="text-sm text-muted-foreground">Free Certifications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">5</p>
                <p className="text-sm text-muted-foreground">Week Program</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">100%</p>
                <p className="text-sm text-muted-foreground">Vendor Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'resources'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Training Resources
        </button>
        <button
          onClick={() => setActiveTab('paths')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'paths'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Learning Paths
        </button>
        <button
          onClick={() => setActiveTab('certifications')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'certifications'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Certifications
        </button>
      </div>

      {/* Resources Tab */}
      {activeTab === 'resources' && (
        <div className="space-y-8">
          {CATEGORY_GROUPS.map((group) => (
            <div key={group.name}>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-gray-100 rounded-lg">
                  {group.icon}
                </div>
                <h2 className="text-lg font-semibold text-gray-900">{group.name}</h2>
              </div>

              <div className="space-y-3">
                {group.ids.map((categoryId) => {
                  const category = TRAINING_CATEGORIES.find(c => c.id === categoryId)
                  if (!category) return null
                  const isExpanded = expandedCategories.includes(category.id)

                  return (
                    <Card key={category.id} className="overflow-hidden">
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                            {category.icon}
                          </div>
                          <div className="text-left">
                            <h3 className="font-medium text-gray-900">{category.title}</h3>
                            <p className="text-sm text-muted-foreground">{category.portal}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">{category.modules.length} modules</Badge>
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t">
                          <div className="p-4 bg-gray-50">
                            <a
                              href={category.portalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Official Portal: {category.portalUrl}
                            </a>
                          </div>
                          <div className="divide-y">
                            {category.modules.map((module, idx) => (
                              <a
                                key={idx}
                                href={module.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors ${
                                  module.highlight ? 'bg-teal-50/50' : ''
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  {module.highlight && (
                                    <span className="text-amber-500">⭐</span>
                                  )}
                                  <span className={`text-sm ${module.highlight ? 'font-medium' : ''}`}>
                                    {module.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Clock className="h-3.5 w-3.5" />
                                    {module.time}
                                  </div>
                                  {module.certification && (
                                    <Badge variant={module.certification.includes('Free') ? 'default' : 'secondary'} className="text-xs">
                                      {module.certification.includes('Free') ? (
                                        <><CheckCircle2 className="h-3 w-3 mr-1" /> {module.certification}</>
                                      ) : (
                                        module.certification
                                      )}
                                    </Badge>
                                  )}
                                  <ExternalLink className="h-4 w-4 text-gray-400" />
                                </div>
                              </a>
                            ))}
                          </div>
                          {category.certInfo && (
                            <div className="px-6 py-3 bg-amber-50 border-t text-sm text-amber-800">
                              <Award className="h-4 w-4 inline mr-2" />
                              {category.certInfo}
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Learning Paths Tab */}
      {activeTab === 'paths' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recommended 5-Week Learning Path</CardTitle>
              <CardDescription>
                Structured onboarding program for new virtual assistants at RPR Haircare
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {LEARNING_PATHS.map((path) => (
                  <div key={path.week} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-600 font-semibold">
                        {path.week}
                      </div>
                      {path.week < LEARNING_PATHS.length && (
                        <div className="w-px flex-1 bg-gray-200 my-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <h3 className="font-semibold text-gray-900">Week {path.week}: {path.title}</h3>
                      </div>
                      <div className="space-y-2">
                        {path.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg"
                          >
                            <CheckCircle2 className="h-4 w-4 text-gray-400" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Certifications Tab */}
      {activeTab === 'certifications' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Certification Summary</CardTitle>
              <CardDescription>
                Available certifications across all training platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Platform</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Certification</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Cost</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Validity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CERTIFICATION_SUMMARY.map((cert, idx) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{cert.platform}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{cert.certification}</td>
                        <td className="py-3 px-4">
                          {cert.cost === 'Free' ? (
                            <Badge variant="default" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                              Free
                            </Badge>
                          ) : cert.cost === '—' ? (
                            <span className="text-sm text-gray-400">—</span>
                          ) : (
                            <span className="text-sm text-gray-600">{cert.cost}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{cert.validity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-teal-50 border-teal-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <Award className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Priority Certifications</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    These free certifications are highly recommended for all VAs:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-white">Google Analytics 4</Badge>
                    <Badge variant="secondary" className="bg-white">Google Ads Search</Badge>
                    <Badge variant="secondary" className="bg-white">Canva Essentials</Badge>
                    <Badge variant="secondary" className="bg-white">Meta Ads Manager</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
