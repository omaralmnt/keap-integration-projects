<?php
require_once '../vendor/autoload.php';
error_reporting(E_ALL & ~E_DEPRECATED);

// Configuración inicial del cliente Infusionsoft
$infusionsoft = new \Infusionsoft\Infusionsoft([
    'clientId'     => 'kTBpcQEoQAluH7DXAqKZhOJUawj2gj8hA36dsQ7OPyPgezfd',
    'clientSecret' => 'opEmGqHcLvuSK2CUKgjowqwkus3snKUyM6b8akndn3WqZxQs6Qx5aizxB1nR7ADj',
    'redirectUri'  => 'http://localhost/callback',
]);

// Token inicial
$tokenArray = [
    'access_token'  => 'mLGmGWRnGtbEzDc7gVwBHxf89bxU',
    'refresh_token' => 'L4HgHtnywJEnCrAg9qbRGqsO8SUQcxKz',
    'expires_in'    => 86399,
    'token_type'    => 'bearer',
    'endOfLife'     => time() + 86399,
];

$token = new \Infusionsoft\Token($tokenArray);
$infusionsoft->setToken($token);

// Refrescar token si ya expiró
if ($infusionsoft->getToken()->isExpired()) {
    $infusionsoft->refreshAccessToken();
    $newToken = $infusionsoft->getToken()->getTokenArray();
    file_put_contents('keap_token.json', json_encode($newToken, JSON_PRETTY_PRINT));
}

try {
    // Primero verificar que el invoice existe
    echo "Verificando si existe invoice con ID 2...\n";
    $invoice = $infusionsoft->data()->findByField(
        'Invoice',
        1,
        0,
        'Id',
        '2',
        array('Id', 'InvoiceTotal', 'PayStatus')
    );
    
    if (empty($invoice)) {
        echo "✗ Invoice con ID 2 no existe\n";
        exit;
    }
    
    echo "✓ Invoice encontrado:\n";
    echo "  ID: " . $invoice[0]['Id'] . "\n";
    echo "  Total: $" . $invoice[0]['InvoiceTotal'] . "\n";
    echo "  Estado: " . ($invoice[0]['PayStatus'] == 1 ? 'Pagado' : 'Pendiente') . "\n\n";
    
    // Intentar eliminar el invoice
    echo "Eliminando invoice con ID 2...\n";
    
    $result = $infusionsoft->data()->delete('Invoice', 2);
    
    if ($result) {
        echo "✓ Invoice eliminado exitosamente\n";
        
        // Verificar que se eliminó
        echo "Verificando eliminación...\n";
        $check = $infusionsoft->data()->findByField('Invoice', 1, 0, 'Id', '2', array('Id'));
        
        if (empty($check)) {
            echo "✓ Confirmado: Invoice ID 2 ya no existe\n";
        } else {
            echo "⚠ Advertencia: Invoice aún existe después de eliminación\n";
        }
        
    } else {
        echo "✗ No se pudo eliminar el invoice\n";
    }
    
} catch (Exception $e) {
    echo "✗ Error al eliminar invoice: " . $e->getMessage() . "\n";
    
    // Algunos errores comunes
    if (strpos($e->getMessage(), 'permission') !== false) {
        echo "Posible causa: No tienes permisos para eliminar invoices\n";
    } elseif (strpos($e->getMessage(), 'referenced') !== false) {
        echo "Posible causa: El invoice está referenciado por otros registros\n";
    } elseif (strpos($e->getMessage(), 'paid') !== false) {
        echo "Posible causa: No se pueden eliminar invoices pagados\n";
    }
}
?>