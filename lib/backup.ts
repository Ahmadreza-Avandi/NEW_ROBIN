import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { createGzip } from 'zlib';

const execAsync = promisify(exec);

interface BackupOptions {
    compress?: boolean;
    includeData?: boolean;
    excludeTables?: string[];
}

interface BackupResult {
    success: boolean;
    filePath?: string;
    fileName?: string;
    fileSize?: number;
    error?: string;
    duration?: number;
}

export class DatabaseBackup {
    private dbConfig = {
        host: process.env.DATABASE_HOST || 'localhost',
        user: 'root',
        password: '1234',
        database: 'crm_system',
    };

    private backupDir = path.join(process.cwd(), 'backups');

    constructor() {
        this.ensureBackupDirectory();
    }

    private async ensureBackupDirectory() {
        try {
            await fs.access(this.backupDir);
        } catch {
            await fs.mkdir(this.backupDir, { recursive: true });
        }
    }

    async createBackup(options: BackupOptions = {}): Promise<BackupResult> {
        const startTime = Date.now();

        try {
            await this.ensureBackupDirectory();

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `crm_backup_${timestamp}.sql${options.compress ? '.gz' : ''}`;
            const filePath = path.join(this.backupDir, fileName);

            // Build mysqldump command
            const mysqldumpCmd = this.buildMysqldumpCommand(options);

            console.log('Starting database backup...');
            console.log('Command:', mysqldumpCmd);

            if (options.compress) {
                // Create compressed backup
                await this.createCompressedBackup(mysqldumpCmd, filePath);
            } else {
                // Create regular backup
                await this.createRegularBackup(mysqldumpCmd, filePath);
            }

            // Get file size
            const stats = await fs.stat(filePath);
            const fileSize = stats.size;

            const duration = Date.now() - startTime;

            console.log(`Backup completed successfully in ${duration}ms`);
            console.log(`File: ${fileName}, Size: ${this.formatFileSize(fileSize)}`);

            return {
                success: true,
                filePath: `/backups/${fileName}`,
                fileName,
                fileSize,
                duration
            };

        } catch (error) {
            console.error('Backup failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown backup error',
                duration: Date.now() - startTime
            };
        }
    }

    private buildMysqldumpCommand(options: BackupOptions): string {
        const { host, user, password, database } = this.dbConfig;

        let cmd = `mysqldump -h ${host} -u ${user}`;

        if (password) {
            cmd += ` -p${password}`;
        }

        // Add options
        cmd += ' --single-transaction --routines --triggers';

        if (!options.includeData) {
            cmd += ' --no-data';
        }

        // Exclude tables if specified
        if (options.excludeTables && options.excludeTables.length > 0) {
            for (const table of options.excludeTables) {
                cmd += ` --ignore-table=${database}.${table}`;
            }
        }

        cmd += ` ${database}`;

        return cmd;
    }

    private async createRegularBackup(command: string, filePath: string): Promise<void> {
        const { stdout } = await execAsync(command);
        await fs.writeFile(filePath, stdout);
    }

    private async createCompressedBackup(command: string, filePath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const child = exec(command);
            const writeStream = createWriteStream(filePath);
            const gzipStream = createGzip();

            child.stdout?.pipe(gzipStream).pipe(writeStream);

            child.on('error', reject);
            writeStream.on('error', reject);
            gzipStream.on('error', reject);

            writeStream.on('finish', resolve);
        });
    }

    async listBackups(): Promise<Array<{
        fileName: string;
        filePath: string;
        size: number;
        sizeFormatted: string;
        createdAt: Date;
    }>> {
        try {
            const files = await fs.readdir(this.backupDir);
            const backupFiles = files.filter(file =>
                file.startsWith('crm_backup_') && (file.endsWith('.sql') || file.endsWith('.sql.gz'))
            );

            const backups = await Promise.all(
                backupFiles.map(async (fileName) => {
                    const filePath = path.join(this.backupDir, fileName);
                    const stats = await fs.stat(filePath);

                    return {
                        fileName,
                        filePath: `/backups/${fileName}`,
                        size: stats.size,
                        sizeFormatted: this.formatFileSize(stats.size),
                        createdAt: stats.birthtime
                    };
                })
            );

            return backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        } catch (error) {
            console.error('Error listing backups:', error);
            return [];
        }
    }

    async deleteBackup(fileName: string): Promise<boolean> {
        try {
            const filePath = path.join(this.backupDir, fileName);
            await fs.unlink(filePath);
            return true;
        } catch (error) {
            console.error('Error deleting backup:', error);
            return false;
        }
    }

    async cleanupOldBackups(retentionDays: number = 30): Promise<number> {
        try {
            const backups = await this.listBackups();
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

            let deletedCount = 0;

            for (const backup of backups) {
                if (backup.createdAt < cutoffDate) {
                    const success = await this.deleteBackup(backup.fileName);
                    if (success) {
                        deletedCount++;
                        console.log(`Deleted old backup: ${backup.fileName}`);
                    }
                }
            }

            return deletedCount;
        } catch (error) {
            console.error('Error cleaning up old backups:', error);
            return 0;
        }
    }

    async getBackupFile(fileName: string): Promise<string | null> {
        try {
            const filePath = path.join(this.backupDir, fileName);
            await fs.access(filePath);
            return filePath;
        } catch {
            return null;
        }
    }

    private formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async testMysqldump(): Promise<{ available: boolean; version?: string; error?: string }> {
        try {
            const { stdout } = await execAsync('mysqldump --version');
            return {
                available: true,
                version: stdout.trim()
            };
        } catch (error) {
            return {
                available: false,
                error: error instanceof Error ? error.message : 'mysqldump not found'
            };
        }
    }
}

export const backupService = new DatabaseBackup();