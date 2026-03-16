import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Download,
  Calendar,
  Filter,
  Users,
  ShieldAlert,
  FileText
} from 'lucide-react'
import { Card } from '../components/ui/Card'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d')

  const metrics = [
    { title: 'Total Registrations', value: '1,248', change: '+12%', icon: FileText, color: 'text-blue-400' },
    { title: 'Verification Success', value: '98.5%', change: '+2.1%', icon: Activity, color: 'text-green-400' },
    { title: 'Active Licenses', value: '842', change: '+5%', icon: Users, color: 'text-purple-400' },
    { title: 'Blocked Infringements', value: '156', change: '-3%', icon: ShieldAlert, color: 'text-red-400' },
  ]

  const handleDownloadReport = () => {
    alert("Generating comprehensive CSV report... This feature is mocked for presentation purposes.")
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Analytics & Reports</h1>
          <p className="text-sm text-gray-400">Comprehensive overview of your DRM ecosystem metrics.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="bg-white/5 border border-white/10 rounded-lg p-1 flex">
            {['7d', '30d', '90d', '1y'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  timeRange === range 
                    ? 'bg-brand-primary text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
          <button 
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-bold rounded-lg shadow-lg shadow-brand-primary/20 transition-all"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-5 border-white/5 bg-white/[0.02] backdrop-blur-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">{metric.title}</p>
                  <h3 className="text-2xl font-bold text-white">{metric.value}</h3>
                </div>
                <div className={`p-3 rounded-lg bg-white/5 ${metric.color}`}>
                  <metric.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className={metric.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}>
                  {metric.change}
                </span>
                <span className="text-gray-500">vs last period</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Chart Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <Card className="lg:col-span-2 p-6 border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-white">Verification Trends</h3>
              <p className="text-sm text-gray-400">Originality checks over time</p>
            </div>
            <BarChart3 className="w-5 h-5 text-gray-500" />
          </div>
          
          <div className="h-[300px] w-full flex items-end justify-between gap-2 px-2">
            {/* CSS-only generic chart visualization mock */}
            {[40, 65, 45, 80, 55, 90, 75, 85, 60, 95, 80, 100].map((height, i) => (
              <div key={i} className="w-full flex flex-col justify-end gap-2 group">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 1, delay: i * 0.05 }}
                  className="w-full bg-brand-primary/20 hover:bg-brand-primary/40 rounded-t-sm relative transition-colors"
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold py-1 px-2 rounded poiner-events-none transition-opacity">
                    {height * 12}
                  </div>
                </motion.div>
                <span className="text-[10px] text-gray-500 text-center font-mono">
                  WK{i+1}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 border-white/5 bg-white/[0.02] flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white">System Status</h3>
            <p className="text-sm text-gray-400">Current engine health</p>
          </div>
          
          <div className="space-y-4 flex-grow">
            {[
              { label: 'Blockchain Node', status: 'Optimal', load: '32%' },
              { label: 'Text Engine', status: 'Optimal', load: '45%' },
              { label: 'Image Engine', status: 'Optimal', load: '18%' },
              { label: 'Audio Engine', status: 'High Load', load: '89%' },
              { label: 'Video Engine', status: 'Optimal', load: '62%' }
            ].map((engine) => (
              <div key={engine.label} className="p-3 bg-white/5 rounded-lg border border-white/5 flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-white">{engine.label}</span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${engine.load > '80%' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {engine.status}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${engine.load > '80%' ? 'bg-amber-500' : 'bg-brand-primary'}`} 
                    style={{ width: engine.load }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
