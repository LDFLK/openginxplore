import React from 'react'
import { X } from 'lucide-react'

export default function PresidentCard({
  president,
  onRemove,
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        <img
          src={president.image}
          alt={president.name}
          className="w-full h-48 object-cover"
        />
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 bg-gray-800/70 hover:bg-gray-900/90 text-white p-1 rounded-full"
          aria-label={`Remove ${president.name}`}
        >
          <X size={18} />
        </button>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h3 className="text-white text-xl font-bold">{president.name}</h3>
          <p className="text-gray-200 text-sm">{president.term}</p>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-center">
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {president.cabinetSize}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Cabinet Members
            </p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-center">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {president.departments}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 break-words">
              Departments
            </p>
          </div>
        </div>
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Key Cabinet Members
        </h4>
        <ul className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          {president.keyCabinetMembers.map((member, index) => (
            <li key={index} className="mb-1 flex items-start">
              <span className="mr-2">•</span>
              <span>
                <span className="font-medium">{member.position}:</span>{' '}
                {member.name}
              </span>
            </li>
          ))}
        </ul>
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Key Events
        </h4>
        <ul className="text-sm text-gray-700 dark:text-gray-300">
          {president.keyEvents.map((event, index) => (
            <li key={index} className="mb-1 flex items-start">
              <span className="mr-2">•</span>
              <span>{event}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
