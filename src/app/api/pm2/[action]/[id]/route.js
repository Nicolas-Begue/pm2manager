import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request, { params }) {
  const { action, id } = params;

  try {
    let command;
    switch (action) {
      case 'restart':
        command = `pm2 restart ${id}`;
        break;
      case 'stop':
        command = `pm2 stop ${id}`;
        break;
      case 'logs':
        command = `pm2 logs ${id} --lines 100`;
        break;
      default:
        return NextResponse.json(
          { error: 'Action non supportée' },
          { status: 400 }
        );
    }

    const { stdout } = await execAsync(command);
    return NextResponse.json({ message: 'Action réussie', output: stdout });
  } catch (error) {
    return NextResponse.json(
      { error: `Erreur lors de l'action ${action}` },
      { status: 500 }
    );
  }
} 