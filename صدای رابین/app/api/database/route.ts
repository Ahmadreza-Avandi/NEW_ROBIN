import { NextRequest, NextResponse } from 'next/server';
import { 
  testConnection, 
  getEmployees, 
  getCustomers, 
  getSalesReport, 
  getTasks, 
  getProjects 
} from '../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'test-connection';

    console.log('📊 Database API request:', action);

    let result;

    switch (action) {
      case 'test-connection':
        const connected = await testConnection();
        return NextResponse.json({
          success: connected,
          message: connected ? 'اتصال به دیتابیس موفق' : 'خطا در اتصال به دیتابیس',
          timestamp: new Date().toISOString()
        });

      case 'employees':
        result = await getEmployees();
        return NextResponse.json({
          success: true,
          data: result,
          count: result.length
        });

      case 'customers':
        result = await getCustomers();
        return NextResponse.json({
          success: true,
          data: result,
          count: result.length
        });

      case 'sales':
        const period = searchParams.get('period') || 'today';
        result = await getSalesReport(period);
        return NextResponse.json({
          success: true,
          period: period,
          data: result,
          count: result.length
        });

      case 'tasks':
        const assignee = searchParams.get('assignee') || null;
        result = await getTasks(assignee);
        return NextResponse.json({
          success: true,
          assignee: assignee,
          data: result,
          count: result.length
        });

      case 'projects':
        result = await getProjects();
        return NextResponse.json({
          success: true,
          data: result,
          count: result.length
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Unknown action'
        }, { status: 400 });
    }

  } catch (error: any) {
    console.error('❌ Database API Error:', error.message);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'خطا در اتصال به دیتابیس'
    }, { status: 500 });
  }
}