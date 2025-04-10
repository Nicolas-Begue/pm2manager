import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const { stdout } = await execAsync('pm2 jlist');
    const processes = JSON.parse(stdout);
    return NextResponse.json(processes);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des processus' },
      { status: 500 }
    );
  }
} 