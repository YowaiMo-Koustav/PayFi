import { NextRequest, NextResponse } from 'next/server';
import locusService, { HumanTaskRequest } from '@/lib/locus';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, priority, assignee, dueDate } = body;

    if (!title || !description || !priority) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, priority' },
        { status: 400 }
      );
    }

    if (!['low', 'medium', 'high'].includes(priority)) {
      return NextResponse.json(
        { error: 'Priority must be one of: low, medium, high' },
        { status: 400 }
      );
    }

    const taskRequest: HumanTaskRequest = {
      title,
      description,
      priority,
      assignee,
      dueDate,
    };

    const result = await locusService.submitHumanTask(taskRequest);

    return NextResponse.json({
      success: true,
      data: result,
      mockMode: locusService.isMockMode(),
    });
  } catch (error) {
    console.error('Error submitting human task:', error);
    return NextResponse.json(
      { 
        error: 'Failed to submit human task',
        message: error instanceof Error ? error.message : 'Unknown error',
        mockMode: locusService.isMockMode(),
      },
      { status: 500 }
    );
  }
}
