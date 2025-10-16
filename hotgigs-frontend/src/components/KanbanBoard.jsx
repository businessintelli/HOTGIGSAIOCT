import React from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { 
  Mail, Phone, Linkedin, FileText, Video, Award, 
  Eye, Calendar, TrendingUp, MapPin
} from 'lucide-react'
import { Button } from './ui/button'

const KanbanBoard = ({ stages, applications, onStatusChange }) => {
  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result

    // Dropped outside the list
    if (!destination) {
      return
    }

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    // Update the application status
    const applicationId = parseInt(draggableId)
    const newStatus = destination.droppableId
    onStatusChange(applicationId, newStatus)
  }

  const getApplicationsByStatus = (status) => {
    return applications.filter(app => app.status === status)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageApplications = getApplicationsByStatus(stage.id)
          const StageIcon = stage.icon

          return (
            <div key={stage.id} className="flex-shrink-0 w-80">
              {/* Stage Header */}
              <div className={`rounded-t-lg p-4 ${stage.color}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StageIcon className="h-5 w-5" />
                    <h3 className="font-semibold">{stage.label}</h3>
                  </div>
                  <span className="px-2 py-1 bg-white bg-opacity-50 rounded-full text-sm font-medium">
                    {stageApplications.length}
                  </span>
                </div>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={stage.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[500px] bg-gray-50 rounded-b-lg p-4 space-y-3 ${
                      snapshot.isDraggingOver ? 'bg-blue-50 ring-2 ring-blue-300' : ''
                    }`}
                  >
                    {stageApplications.map((application, index) => (
                      <Draggable
                        key={application.id}
                        draggableId={application.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-move ${
                              snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-400' : ''
                            }`}
                          >
                            {/* Candidate Avatar and Name */}
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {application.candidate.avatar}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 truncate">
                                  {application.candidate.name}
                                </h4>
                                <p className="text-sm text-gray-600 truncate">
                                  {application.candidate.title}
                                </p>
                              </div>
                            </div>

                            {/* Location */}
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                              <MapPin className="h-3 w-3" />
                              {application.candidate.location}
                            </div>

                            {/* Skill Match Badge */}
                            <div className="mb-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-600">Skill Match</span>
                                <span className="text-xs font-semibold text-gray-900">
                                  {application.skillMatch}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    application.skillMatch >= 90
                                      ? 'bg-green-500'
                                      : application.skillMatch >= 75
                                      ? 'bg-blue-500'
                                      : application.skillMatch >= 60
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500'
                                  }`}
                                  style={{ width: `${application.skillMatch}%` }}
                                />
                              </div>
                            </div>

                            {/* AI Score */}
                            {application.aiScore && (
                              <div className="flex items-center gap-1 mb-3">
                                <Award className="h-4 w-4 text-purple-600" />
                                <span className="text-xs text-gray-600">AI Score:</span>
                                <span className="text-xs font-semibold text-purple-600">
                                  {application.aiScore}/100
                                </span>
                              </div>
                            )}

                            {/* Key Info */}
                            <div className="space-y-2 mb-3 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Experience</span>
                                <span className="font-medium text-gray-900">
                                  {application.experience}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Expected Salary</span>
                                <span className="font-medium text-gray-900">
                                  {application.expectedSalary}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Availability</span>
                                <span className="font-medium text-gray-900">
                                  {application.availability}
                                </span>
                              </div>
                            </div>

                            {/* Skills Tags */}
                            {application.skills && application.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {application.skills.slice(0, 3).map((skill, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {application.skills.length > 3 && (
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                    +{application.skills.length - 3}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Interview Date (if scheduled) */}
                            {application.interviewDate && (
                              <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                                <div className="flex items-center gap-1 text-yellow-700">
                                  <Calendar className="h-3 w-3" />
                                  <span className="font-medium">
                                    {application.interviewDate} at {application.interviewTime}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Offer Details (if offered) */}
                            {application.offerAmount && (
                              <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded text-xs">
                                <div className="flex items-center justify-between text-green-700">
                                  <span className="font-medium">Offer Amount</span>
                                  <span className="font-bold">{application.offerAmount}</span>
                                </div>
                              </div>
                            )}

                            {/* Rejection Reason (if rejected) */}
                            {application.rejectionReason && (
                              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs">
                                <p className="text-red-700">{application.rejectionReason}</p>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="flex-1 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  console.log('View profile:', application.id)
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="flex-1 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  console.log('Message candidate:', application.id)
                                }}
                              >
                                <Mail className="h-3 w-3 mr-1" />
                                Message
                              </Button>
                            </div>

                            {/* Applied Date */}
                            <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                              Applied: {application.appliedDate}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {/* Empty State */}
                    {stageApplications.length === 0 && (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        No candidates in this stage
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}

export default KanbanBoard

