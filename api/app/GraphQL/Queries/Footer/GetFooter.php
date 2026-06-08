<?php declare(strict_types=1);

namespace App\GraphQL\Queries\Footer;

use App\Models\Footer;

final readonly class GetFooter
{
    public function footers(null $_, array $args)
    {
        return Footer::all(); // <--- CHANGE THIS TO RETURN ALL RECORDS
    }

    public function footer(null $_, array $args)
    {
        return Footer::find($args['id']);
    }
    public function activeFooter(null $_, array $args): ?Footer
{
    return Footer::where('status', true)->first() ?? Footer::first();
}

}
