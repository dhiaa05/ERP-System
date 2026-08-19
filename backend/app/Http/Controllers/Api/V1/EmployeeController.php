<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use App\Http\Resources\EmployeeResource;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $query = Employee::latest();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $perPage = $request->input('per_page', 15);
        return EmployeeResource::collection($query->paginate($perPage));
    }

    public function store(StoreEmployeeRequest $request)
    {
        $data = $request->validated();
        $data['created_by'] = Auth::id();
        
        $employee = Employee::create($data);
        return new EmployeeResource($employee);
    }

    public function show(Employee $employee)
    {
        return new EmployeeResource($employee);
    }

    public function update(UpdateEmployeeRequest $request, Employee $employee)
    {
        $data = $request->validated();
        $data['updated_by'] = Auth::id();

        $employee->update($data);
        return new EmployeeResource($employee);
    }

    public function destroy(Employee $employee)
    {
        $employee->delete();
        return response()->noContent();
    }
}
