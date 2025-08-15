import { Card, CardContent } from './Card';

export function ModuleCard({ 
  title, 
  description, 
  icon, 
  color = 'blue', 
  onClick, 
  className = '' 
}) {
  const colorClasses = {
    blue: 'border-blue-500 text-blue-600 bg-blue-100',
    purple: 'border-purple-500 text-purple-600 bg-purple-100',
    green: 'border-green-500 text-green-600 bg-green-100',
    orange: 'border-orange-500 text-orange-600 bg-orange-100',
    red: 'border-red-500 text-red-600 bg-red-100',
    indigo: 'border-indigo-500 text-indigo-600 bg-indigo-100'
  };

  return (
    <Card 
      className={`hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-${color}-500 ${className}`}
      onClick={onClick}
    >
      <CardContent>
        <div className="flex items-center mb-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${color}-100`}>
            <div className={`text-${color}-600`}>
              {icon}
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 ml-3">{title}</h3>
        </div>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        <div className={`flex items-center text-${color}-600 text-sm font-medium`}>
          <span>Explore {title}</span>
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}