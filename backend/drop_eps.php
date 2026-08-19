<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=lamsti_os', 'root', '');
    $pdo->exec('DROP TABLE IF EXISTS employee_performance_snapshots');
    echo 'Table dropped.' . PHP_EOL;
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage() . PHP_EOL;
    exit(1);
}
