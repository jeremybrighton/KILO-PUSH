<?php

/**
 * Database Seeder
 * Creates default admin user and sample data for testing
 * 
 * Run with: php artisan db:seed
 */

namespace Database\Seeders;

use App\Models\User;
use App\Models\FraudResult;
use App\Models\Dataset;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Admin User
        $admin = User::updateOrCreate(
            ['email' => 'admin@fraudguard.com'],
            [
                'name' => 'System Admin',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ]
        );
        echo "✓ Admin user created: admin@fraudguard.com / admin123\n";

        // 2. Create Analyst User
        $analyst = User::updateOrCreate(
            ['email' => 'analyst@fraudguard.com'],
            [
                'name' => 'Security Analyst',
                'password' => Hash::make('analyst123'),
                'role' => 'analyst',
            ]
        );
        echo "✓ Analyst user created: analyst@fraudguard.com / analyst123\n";

        // 3. Create Vendor User
        $vendor = User::updateOrCreate(
            ['email' => 'vendor@fraudguard.com'],
            [
                'name' => 'Test Vendor',
                'password' => Hash::make('vendor123'),
                'role' => 'vendor',
            ]
        );
        echo "✓ Vendor user created: vendor@fraudguard.com / vendor123\n";

        // 4. Create sample dataset for testing
        $dataset = Dataset::updateOrCreate(
            ['filename' => 'sample_transactions.csv'],
            [
                'filename' => 'sample_transactions.csv',
                'original_name' => 'sample_transactions.csv',
                'file_path' => '/storage/datasets/sample_transactions.csv',
                'file_size' => 15728640, // 15MB
                'row_count' => 10000,
                'status' => 'completed',
                'user_id' => $admin->id,
            ]
        );
        echo "✓ Sample dataset created\n";

        // 5. Create sample fraud results (for demo purposes)
        $this->createSampleFraudResults($dataset->id);
        echo "✓ Sample fraud results created\n";

        echo "\n========================================\n";
        echo "LOGIN CREDENTIALS:\n";
        echo "========================================\n";
        echo "Admin:   admin@fraudguard.com   / admin123\n";
        echo "Analyst: analyst@fraudguard.com / analyst123\n";
        echo "Vendor:  vendor@fraudguard.com  / vendor123\n";
        echo "========================================\n\n";
    }

    private function createSampleFraudResults(int $datasetId): void
    {
        $vendors = ['TechCorp Ltd', 'QuickPay Inc', 'SafeShop', 'CafeChain', 'NewVendorXYZ'];
        $countries = ['GB', 'US', 'DE', 'FR', 'CA', 'XX'];
        
        for ($i = 0; $i < 100; $i++) {
            $isFraud = rand(1, 100) <= 15; // 15% fraud rate
            $riskScore = $isFraud ? (rand(70, 99) / 100) : (rand(1, 40) / 100);
            
            FraudResult::create([
                'dataset_id' => $datasetId,
                'transaction_id' => 'TXN-' . str_pad($i + 1, 6, '0', STR_PAD_LEFT),
                'vendor_name' => $vendors[array_rand($vendors)],
                'amount' => rand(10, 50000),
                'country' => $countries[array_rand($countries)],
                'is_fraud' => $isFraud,
                'fraud_probability' => $riskScore,
                'model_version' => 'v2.1.0',
                'processed_at' => now()->subHours(rand(0, 72)),
            ]);
        }
    }
}
